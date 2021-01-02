import { SourceResolver } from './SourceResolver';
export declare class UnpkgSourceResolver implements SourceResolver {
    resolvePackageJson(packageName: string, version: string | undefined): Promise<string | undefined>;
    resolveSourceFile(packageName: string, version: string | undefined, path: string): Promise<string | undefined>;
    private resolveFile;
}
