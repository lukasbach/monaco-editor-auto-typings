export interface ImportResourcePathPackage {
    kind: 'package';
    packageName: string;
    importPath?: string;
}
export interface ImportResourcePathRelative {
    kind: 'relative';
    importPath: string;
    sourcePath: string;
}
export interface ImportResourcePathRelativeInPackage {
    kind: 'relative-in-package';
    packageName: string;
    importPath: string;
    sourcePath: string;
}
export declare type ImportResourcePath = ImportResourcePathPackage | ImportResourcePathRelative | ImportResourcePathRelativeInPackage;
