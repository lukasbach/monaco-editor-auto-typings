import { Options } from './Options';
import { SourceCache } from './SourceCache';
import { ImportResourcePath } from './ImportResourcePath';
import { SourceResolver } from './SourceResolver';
export declare class ImportResolver {
    private options;
    private cache;
    private sourceResolver;
    private versions?;
    private loadedFiles;
    private dependencyParser;
    constructor(options: Options, cache: SourceCache, sourceResolver: SourceResolver, versions?: {
        [packageName: string]: string;
    } | undefined);
    resolveImportsInFile(source: string, parent: string | ImportResourcePath): Promise<void>;
    private resolveImport;
    private resolveImportInPackage;
    private resolveImportFromPackageRoot;
    private loadSourceFileContents;
    private getVersion;
    setVersions(versions?: {
        [packageName: string]: string;
    }): void;
    private createModel;
    private hashImportResourcePath;
}
