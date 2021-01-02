import { editor } from "monaco-editor";
import { Options } from './Options';
export declare class AutoTypings {
    private editor;
    private options;
    private importResolver;
    private constructor();
    static create(editor: editor.ICodeEditor, options?: Partial<Options>): AutoTypings;
    setVersions(versions: object): void;
    getVersions(versions: object): void;
}
