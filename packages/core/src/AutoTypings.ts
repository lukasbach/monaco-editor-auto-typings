import { editor } from "monaco-editor";
import { SourceCache } from './SourceCache';
import { Options } from './Options';
import { DummySourceCache } from './DummySourceCache';
import { UnpkgSourceResolver } from './UnpkgSourceResolver';
import { ImportResolver } from './ImportResolver';
import * as path from 'path';

export class AutoTypings {
  private importResolver: ImportResolver;

  private constructor(
    private editor: editor.ICodeEditor,
    private options: Options,
  ) {
    this.importResolver = new ImportResolver(options, options.sourceCache, options.sourceResolver);
    editor.onDidChangeModelContent(e => {
      console.log("Picked up change")
      const model = editor.getModel();
      if (!model) throw Error("No model");
      const content = model.getLinesContent();
      this.importResolver.resolveImportsInFile(content.join('\n'), path.dirname(model.uri.toString()));
    })
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
        ...options
      }
    );
  }

  public setVersions(versions: object) {}

  public getVersions(versions: object) {}
}