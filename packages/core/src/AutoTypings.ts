import { editor, languages } from 'monaco-editor';
import { SourceCache } from './SourceCache';
import { Options } from './Options';
import { DummySourceCache } from './DummySourceCache';
import { UnpkgSourceResolver } from './UnpkgSourceResolver';
import { ImportResolver } from './ImportResolver';
import * as path from 'path';
import * as monaco from 'monaco-editor';

export class AutoTypings {
  private static sharedCache?: SourceCache;
  private importResolver: ImportResolver;
  private debounceTimer?: number;
  private isResolving?: boolean;

  private constructor(
    private editor: editor.ICodeEditor,
    private options: Options,
  ) {
    this.importResolver = new ImportResolver(options);
    editor.onDidChangeModelContent(e => {
      this.debouncedResolveContents();
    });
    this.resolveContents();
    if (!options.dontAdaptEditorOptions) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
        allowSyntheticDefaultImports: true
      });
    }
  }

  public static create(editor: editor.ICodeEditor, options?: Partial<Options>): AutoTypings {
    if (options?.shareCache && options.sourceCache && !AutoTypings.sharedCache) {
      AutoTypings.sharedCache = options.sourceCache;
    }

    return new AutoTypings(
      editor,
{
        fileRootPath: 'inmemory://model/',
        onlySpecifiedPackages: false,
        preloadPackages: false,
        shareCache: false,
        dontAdaptEditorOptions: false,
        sourceCache: AutoTypings.sharedCache ?? new DummySourceCache(),
        sourceResolver: new UnpkgSourceResolver(),
        debounceDuration: 4000,
        ...options
      }
    );
  }

  public setVersions(versions: { [packageName: string]: string }) {
    this.importResolver.setVersions(versions);
    this.options.versions = versions;
  }

  public async clearCache() {
    await this.options.sourceCache.clear();
  }

  private debouncedResolveContents() {
    if (this.isResolving) {
      return;
    }

    if (this.options.debounceDuration <= 0) {
      this.isResolving = true;
      this.resolveContents().then(() => {
        this.isResolving = false;
      });
    } else {
      if (this.debounceTimer !== undefined) {
        clearTimeout(this.debounceTimer);
      }
      setTimeout(async () => {
        this.isResolving = true;
        await this.resolveContents();
        this.isResolving = false;
        this.debounceTimer = undefined;
      }, this.options.debounceDuration);
    }
  }

  private async resolveContents() {
    const model = this.editor.getModel();
    if (!model) {
      throw Error("No model");
    }
    const content = model.getLinesContent();
    await this.importResolver.resolveImportsInFile(content.join('\n'), path.dirname(model.uri.toString()));
  }
}