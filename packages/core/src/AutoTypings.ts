import { editor } from "monaco-editor";
import { SourceCache } from './SourceCache';
import { Options } from './Options';
import { DummySourceCache } from './DummySourceCache';
import { UnpkgSourceResolver } from './UnpkgSourceResolver';
import { ImportResolver } from './ImportResolver';
import * as path from 'path';

export class AutoTypings {
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
  }

  public static create(editor: editor.ICodeEditor, options?: Partial<Options>): AutoTypings {
    return new AutoTypings(
      editor,
{
        fileRootPath: 'inmemory://model/',
        onlySpecifiedPackages: false,
        preloadPackages: false,
        shareCache: false,
        sourceCache: new DummySourceCache(),
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

  public getVersions(versions: object) {}

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