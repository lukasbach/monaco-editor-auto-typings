export interface SourceResolver {
    resolvePackageJson: (packageName: string, version?: string) => Promise<string | undefined>;
    resolveSourceFile: (packageName: string, version: string | undefined, path: string) => Promise<string | undefined>;
}
