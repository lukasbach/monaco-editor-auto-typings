import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Options } from './Options';
import { SourceCache } from './SourceCache';
import { Uri } from 'monaco-editor/esm/vs/editor/editor.api';
import { DummySourceCache } from './DummySourceCache';
import { UnpkgSourceResolver } from './UnpkgSourceResolver';
import { DependencyParser } from './DependencyParser';
import {
  ImportResourcePath,
  ImportResourcePathPackage,
  ImportResourcePathRelativeInPackage, importResourcePathToString,
} from './ImportResourcePath';
import { SourceResolver } from './SourceResolver';
import * as path from 'path';
import { invokeUpdate } from './invokeUpdate';

export class ImportResolver {
  private loadedFiles: string[];
  private dependencyParser: DependencyParser;
  private cache: SourceCache;
  private sourceResolver: SourceResolver;
  private versions?: { [packageName: string]: string };

  constructor(
    private options: Options,
  ) {
    this.loadedFiles = [];
    this.dependencyParser = new DependencyParser();
    this.cache = options.sourceCache;
    this.sourceResolver = options.sourceResolver;

    if (options.preloadPackages && options.versions) {
      for (const [packageName, version] of Object.entries(options.versions)) {
        this.resolveImport({
          kind: 'package',
          packageName: packageName,
          importPath: ''
        })
      }
    }
  }

  public async resolveImportsInFile(source: string, parent: string | ImportResourcePath) {
    const imports = this.dependencyParser.parseDependencies(source, parent);
    for (const importCall of imports) {
      await this.resolveImport(importCall);
    }
  }

  private async resolveImport(importResource: ImportResourcePath) {
    const hash = this.hashImportResourcePath(importResource);
    if (this.loadedFiles.includes(hash)) {
      return;
    }

    this.loadedFiles.push(hash);

    switch (importResource.kind) {
      case 'package':
        const packageRelativeImport = await this.resolveImportFromPackageRoot(importResource);
        if (packageRelativeImport) {
          return await this.resolveImportInPackage(packageRelativeImport);
        }
      case 'relative':
        throw Error('Not implemented yet');
      case 'relative-in-package':
        return await this.resolveImportInPackage(importResource);
    }
  }

  private async resolveImportInPackage(importResource: ImportResourcePathRelativeInPackage) {
    const { source, at } = await this.loadSourceFileContents(importResource);
    this.createModel(source, Uri.parse(this.options.fileRootPath + path.join(`node_modules/${importResource.packageName}`, at)));
    await this.resolveImportsInFile(source, {
      kind: 'relative-in-package',
      packageName: importResource.packageName,
      sourcePath: path.dirname(at),
      importPath: ''
    });
  }

  private async resolveImportFromPackageRoot(importResource: ImportResourcePathPackage): Promise<ImportResourcePathRelativeInPackage | undefined> {
    const failedProgressUpdate = {
      type: 'LookedUpPackage',
      package: importResource.packageName,
      definitelyTyped: false,
      success: false
    } as const;

    const pkgJson = await this.resolvePackageJson(
      importResource.packageName,
      this.versions?.[importResource.packageName]
    );

    if (pkgJson) {
      const pkg = JSON.parse(pkgJson);
      if (pkg.typings || pkg.types) {
        const typings = pkg.typings || pkg.types;
        this.createModel(pkgJson, Uri.parse(`${this.options.fileRootPath}node_modules/${importResource.packageName}/package.json`));
        invokeUpdate({
          type: 'LookedUpPackage',
          package: importResource.packageName,
          definitelyTyped: false,
          success: true
        }, this.options);
        this.setVersion(importResource.packageName, pkg.version);
        return {
          kind: 'relative-in-package',
          packageName: importResource.packageName,
          sourcePath: '',
          importPath: typings.startsWith('./') ? typings.slice(2) : typings
        };
      } else {
        const typingPackageName = `@types/${importResource.packageName.startsWith('@')
          ? importResource.packageName.slice(1).replace(/\//, '__')
          : importResource.packageName}`;
        const pkgJsonTypings = await this.resolvePackageJson(
          typingPackageName,
          this.versions?.[typingPackageName]
        );
        if (pkgJsonTypings) {
          const pkg = JSON.parse(pkgJsonTypings);
          if (pkg.typings || pkg.types) {
            const typings = pkg.typings || pkg.types;
            this.createModel(pkgJsonTypings, Uri.parse(`${this.options.fileRootPath}node_modules/${typingPackageName}/package.json`));
            invokeUpdate({
              type: 'LookedUpPackage',
              package: typingPackageName,
              definitelyTyped: true,
              success: true
            }, this.options);
            this.setVersion(typingPackageName, pkg.version);
            return {
              kind: 'relative-in-package',
              packageName: typingPackageName,
              sourcePath: '',
              importPath: typings.startsWith('./') ? typings.slice(2) : typings
            };
          } else {
            invokeUpdate(failedProgressUpdate, this.options);
            // throw Error(`${typingPackageName} exists, but does not provide types.`)
          }
        } else {
          invokeUpdate(failedProgressUpdate, this.options);
          // throw Error(`Package exists ${importResource.packageName}, but does not provide typings, `
          //   + `and ${typingPackageName} does not exist.`);
        }
      }
    } else {
      invokeUpdate(failedProgressUpdate, this.options);
      // throw Error(`Cannot find package ${importResource.packageName}`);
    }
  }

  private async loadSourceFileContents(importResource: ImportResourcePathRelativeInPackage): Promise<{ source: string, at: string }> {
    const progressUpdatePath = path.join(importResource.packageName, importResource.sourcePath, importResource.importPath);

    const failedProgressUpdate = {
      type: 'LookedUpTypeFile',
      path: progressUpdatePath,
      definitelyTyped: false,
      success: false
    } as const;

    const pkgName = importResource.packageName;
    const version = this.getVersion(importResource.packageName);

    let appends = ['.d.ts', '/index.d.ts', '.ts', '.tsx', '/index.ts', '/index.tsx'];

    if (appends.map(append => importResource.importPath.endsWith(append)).reduce((a, b) => a || b, false)) {
      const source = await this.resolveSourceFile(pkgName, version,
        path.join(importResource.sourcePath, importResource.importPath));
      if (source) {
        return { source, at: path.join(importResource.sourcePath, importResource.importPath) };
      }
    } else {
      for (const append of appends) {
        const fullPath = path.join(importResource.sourcePath, importResource.importPath) + append;
        const source = await this.resolveSourceFile(pkgName, version, fullPath);
        invokeUpdate({
          type: 'AttemptedLookUpFile',
          path: fullPath,
          success: !!source
        }, this.options);
        if (source) {
          invokeUpdate({
            type: 'LookedUpTypeFile',
            path: fullPath,
            success: true
          }, this.options);
          return { source, at: path.join(importResource.sourcePath, importResource.importPath) + append };
        }
      }
    }

    invokeUpdate(failedProgressUpdate, this.options);
    throw Error(`Could not resolve ${importResource.packageName}/${importResource.sourcePath}${importResource.importPath}`);
  }

  private getVersion(packageName: string) {
    return this.versions?.[packageName];
  }

  public setVersions(versions: { [packageName: string]: string }) {
    this.versions = versions;
    this.options.onUpdateVersions?.(versions);
    // TODO reload packages whose version has changed
  }

  private setVersion(packageName: string, version: string) {
    this.setVersions({
      ...this.versions,
      [packageName]: version
    });
  }

  private createModel(source: string, uri: Uri) {
    uri = uri.with({ path: uri.path.replace('@types/', '') })
    monaco.editor.createModel(source, 'typescript', uri);
  }

  private hashImportResourcePath(p: ImportResourcePath) {
    return importResourcePathToString(p);
  }

  private async resolvePackageJson(packageName: string, version?: string): Promise<string | undefined> {
    const uri = path.join(packageName + (version ? `@${version}` : ''), 'package.json');
    let isAvailable = false;
    let content: string | undefined = undefined;

    if (this.cache.isFileAvailable) {
      isAvailable = await this.cache.isFileAvailable(uri);
    } else {
      content = await this.cache.getFile(uri);
      isAvailable = content !== undefined;
    }

    if (isAvailable) {
      return content ?? await this.cache.getFile(uri);
    } else {
      content = await this.sourceResolver.resolvePackageJson(packageName, version);
      if (content) {
        this.cache.storeFile(uri, content);
      }
      return content;
    }
  }

  private async resolveSourceFile(packageName: string, version: string | undefined, filePath: string): Promise<string | undefined> {
    const uri = path.join(packageName + (version ? `@${version}` : ''), filePath);
    let isAvailable = false;
    let content: string | undefined = undefined;

    if (this.cache.isFileAvailable) {
      isAvailable = await this.cache.isFileAvailable(uri);
    } else {
      content = await this.cache.getFile(uri);
      isAvailable = content !== undefined;
    }

    if (isAvailable) {
      invokeUpdate({
        type: 'LoadedFromCache',
        importPath: uri
      }, this.options);
      return content ?? await this.cache.getFile(uri);
    } else {
      content = await this.sourceResolver.resolveSourceFile(packageName, version, filePath);
      if (content) {
        invokeUpdate({
          type: 'StoredToCache',
          importPath: uri
        }, this.options);
        this.cache.storeFile(uri, content);
      }
      return content;
    }
  }
}