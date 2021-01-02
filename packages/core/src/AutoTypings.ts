import { editor } from "monaco-editor";
import { SourceCache } from './SourceCache';
import { Options } from './Options';
import { DummySourceCache } from './DummySourceCache';
import { UnpkgSourceResolver } from './UnpkgSourceResolver';

export class AutoTypings {
  private constructor(
    private editor: editor.ICodeEditor,
    private options: Options,
  ) {
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