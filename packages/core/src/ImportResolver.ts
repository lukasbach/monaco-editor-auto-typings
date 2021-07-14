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
  ImportResourcePathRelativeInPackage,
  importResourcePathToString,
} from './ImportResourcePath';
import { SourceResolver } from './SourceResolver';
import * as path from 'path';
import { invokeUpdate } from './invokeUpdate';
import { RecursionDepth } from './RecursionDepth';

export class ImportResolver {
  private loadedFiles: string[];
  private dependencyParser: DependencyParser;
  private cache: SourceCache;
  private sourceResolver: SourceResolver;
  private versions?: { [packageName: string]: string };
  private newImportsResolved: boolean;

  constructor(private options: Options) {
    this.loadedFiles = [];
    this.dependencyParser = new DependencyParser();
    this.cache = options.sourceCache;
    this.sourceResolver = options.sourceResolver;
    this.newImportsResolved = false;

    if (options.preloadPackages && options.versions) {
      for (const [packageName, version] of Object.entries(options.versions)) {
        this.resolveImport(
          {
            kind: 'package',
            packageName: packageName,
            importPath: '',
          },
          new RecursionDepth(this.options)
        );
      }
    }
  }

  public wereNewImportsResolved() {
    return this.newImportsResolved;
  }

  public resetNewImportsResolved() {
    this.newImportsResolved = false;
  }

  public async resolveImportsInFile(source: string, parent: string | ImportResourcePath, depth: RecursionDepth) {
    if (depth.shouldStop()) {
      return;
    }

    const imports = this.dependencyParser.parseDependencies(source, parent);
    for (const importCall of imports) {
      await this.resolveImport(importCall, depth);
    }
  }

  private async resolveImport(importResource: ImportResourcePath, depth: RecursionDepth) {
    const hash = this.hashImportResourcePath(importResource);
    if (this.loadedFiles.includes(hash)) {
      return;
    }

    this.loadedFiles.push(hash);

    switch (importResource.kind) {
      case 'package':
        const packageRelativeImport = await this.resolveImportFromPackageRoot(importResource);
        if (packageRelativeImport) {
          return await this.resolveImportInPackage(packageRelativeImport, depth.nextPackage().nextFile());
        }
        break;
      case 'relative':
        throw Error('Not implemented yet');
      case 'relative-in-package':
        return await this.resolveImportInPackage(importResource, depth.nextFile());
    }
  }

  private async resolveImportInPackage(importResource: ImportResourcePathRelativeInPackage, depth: RecursionDepth) {
    const { source, at } = await this.loadSourceFileContents(importResource);
    this.createModel(
      source,
      Uri.parse(this.options.fileRootPath + path.join(`node_modules/${importResource.packageName}`, at))
    );
    await this.resolveImportsInFile(
      source,
      {
        kind: 'relative-in-package',
        packageName: importResource.packageName,
        sourcePath: path.dirname(at),
        importPath: '',
      },
      depth
    );
  }

  private async resolveImportFromPackageRoot(
    importResource: ImportResourcePathPackage
  ): Promise<ImportResourcePathRelativeInPackage | undefined> {
    const failedProgressUpdate = {
      type: 'LookedUpPackage',
      package: importResource.packageName,
      definitelyTyped: false,
      success: false,
    } as const;

    if (this.options.onlySpecifiedPackages) {
      if (!this.versions?.[importResource.packageName] && !this.versions?.['@types/' + importResource.packageName]) {
        invokeUpdate(failedProgressUpdate, this.options);
        return;
      }
    }

    const doesPkgJsonHasSubpath = importResource.importPath?.length ?? 0 > 0;
    let pkgJsonSubpath = doesPkgJsonHasSubpath ? `/${importResource.importPath}` : '';
    let pkgJson = await this.resolvePackageJson(
      importResource.packageName,
      this.versions?.[importResource.packageName],
      doesPkgJsonHasSubpath ? importResource.importPath : undefined
    );

    if (!pkgJson && doesPkgJsonHasSubpath) {
      pkgJson = await this.resolvePackageJson(
        importResource.packageName,
        this.versions?.[importResource.packageName]
      );
      pkgJsonSubpath = '';
    }

    if (pkgJson) {
      const pkg = JSON.parse(pkgJson);
      if (pkg.typings || pkg.types) {
        const typings = pkg.typings || pkg.types;
        this.createModel(
          pkgJson,
          Uri.parse(`${this.options.fileRootPath}node_modules/${importResource.packageName}${pkgJsonSubpath}/package.json`)
        );
        invokeUpdate(
          {
            type: 'LookedUpPackage',
            package: importResource.packageName,
            definitelyTyped: false,
            success: true,
          },
          this.options
        );
        this.setVersion(importResource.packageName, pkg.version);
        return {
          kind: 'relative-in-package',
          packageName: importResource.packageName,
          sourcePath: '',
          importPath: path.join(importResource.importPath ?? "", typings.startsWith('./') ? typings.slice(2) : typings),
        };
      } else {
        const typingPackageName = `@types/${
          importResource.packageName.startsWith('@')
            ? importResource.packageName.slice(1).replace(/\//, '__')
            : importResource.packageName
        }`;
        const pkgJsonTypings = await this.resolvePackageJson(typingPackageName, this.versions?.[typingPackageName]);
        if (pkgJsonTypings) {
          const pkg = JSON.parse(pkgJsonTypings);
          if (pkg.typings || pkg.types) {
            const typings = pkg.typings || pkg.types;
            this.createModel(
              pkgJsonTypings,
              Uri.parse(`${this.options.fileRootPath}node_modules/${typingPackageName}/package.json`)
            );
            invokeUpdate(
              {
                type: 'LookedUpPackage',
                package: typingPackageName,
                definitelyTyped: true,
                success: true,
              },
              this.options
            );
            this.setVersion(typingPackageName, pkg.version);
            return {
              kind: 'relative-in-package',
              packageName: typingPackageName,
              sourcePath: '',
              importPath: path.join(importResource.importPath ?? "", typings.startsWith('./') ? typings.slice(2) : typings),
            };
          } else {
            invokeUpdate(failedProgressUpdate, this.options);
          }
        } else {
          invokeUpdate(failedProgressUpdate, this.options);
        }
      }
    } else {
      invokeUpdate(failedProgressUpdate, this.options);
    }
  }

  private async loadSourceFileContents(
    importResource: ImportResourcePathRelativeInPackage
  ): Promise<{ source: string; at: string }> {
    const progressUpdatePath = path.join(
      importResource.packageName,
      importResource.sourcePath,
      importResource.importPath
    );

    const failedProgressUpdate = {
      type: 'LookedUpTypeFile',
      path: progressUpdatePath,
      definitelyTyped: false,
      success: false,
    } as const;

    const pkgName = importResource.packageName;
    const version = this.getVersion(importResource.packageName);

    let appends = ['.d.ts', '/index.d.ts', '.ts', '.tsx', '/index.ts', '/index.tsx'];

    if (appends.map(append => importResource.importPath.endsWith(append)).reduce((a, b) => a || b, false)) {
      const source = await this.resolveSourceFile(
        pkgName,
        version,
        path.join(importResource.sourcePath, importResource.importPath)
      );
      if (source) {
        return { source, at: path.join(importResource.sourcePath, importResource.importPath) };
      }
    } else {
      for (const append of appends) {
        const fullPath = path.join(importResource.sourcePath, importResource.importPath) + append;
        const source = await this.resolveSourceFile(pkgName, version, fullPath);
        invokeUpdate(
          {
            type: 'AttemptedLookUpFile',
            path: path.join(pkgName, fullPath),
            success: !!source,
          },
          this.options
        );
        if (source) {
          invokeUpdate(
            {
              type: 'LookedUpTypeFile',
              path: path.join(pkgName, fullPath),
              success: true,
            },
            this.options
          );
          return { source, at: fullPath };
        }
      }
    }

    const pkgJson = await this.resolvePackageJson(pkgName, version, path.join(importResource.sourcePath, importResource.importPath));

    if (pkgJson) {
      const { types } = JSON.parse(pkgJson);
      if (types) {
        const fullPath = path.join(importResource.sourcePath, importResource.importPath, types);
        const source = await this.resolveSourceFile(pkgName, version, fullPath);
        if (source) {
          invokeUpdate(
            {
              type: 'LookedUpTypeFile',
              path: path.join(pkgName, fullPath),
              success: true,
            },
            this.options
          );
          return { source, at: fullPath };
        }
      }
    }

    invokeUpdate(failedProgressUpdate, this.options);
    throw Error(
      `Could not resolve ${importResource.packageName}/${importResource.sourcePath}${importResource.importPath}`
    );
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
      [packageName]: version,
    });
  }

  private createModel(source: string, uri: Uri) {
    uri = uri.with({ path: uri.path.replace('@types/', '') });
    if (!monaco.editor.getModel(uri)) {
      monaco.editor.createModel(source, 'typescript', uri);
      this.newImportsResolved = true;
    }
  }

  private hashImportResourcePath(p: ImportResourcePath) {
    return importResourcePathToString(p);
  }

  private async resolvePackageJson(packageName: string, version?: string, subPath?: string): Promise<string | undefined> {
    const uri = path.join(packageName + (version ? `@${version}` : ''), subPath ?? '', 'package.json');
    let isAvailable = false;
    let content: string | undefined = undefined;

    if (this.cache.isFileAvailable) {
      isAvailable = await this.cache.isFileAvailable(uri);
    } else {
      content = await this.cache.getFile(uri);
      isAvailable = content !== undefined;
    }

    if (isAvailable) {
      return content ?? (await this.cache.getFile(uri));
    } else {
      content = await this.sourceResolver.resolvePackageJson(packageName, version, subPath);
      if (content) {
        this.cache.storeFile(uri, content);
      }
      return content;
    }
  }

  private async resolveSourceFile(
    packageName: string,
    version: string | undefined,
    filePath: string
  ): Promise<string | undefined> {
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
      invokeUpdate(
        {
          type: 'LoadedFromCache',
          importPath: uri,
        },
        this.options
      );
      return content ?? (await this.cache.getFile(uri));
    } else {
      content = await this.sourceResolver.resolveSourceFile(packageName, version, filePath);
      if (content) {
        invokeUpdate(
          {
            type: 'StoredToCache',
            importPath: uri,
          },
          this.options
        );
        this.cache.storeFile(uri, content);
      }
      return content;
    }
  }
}
