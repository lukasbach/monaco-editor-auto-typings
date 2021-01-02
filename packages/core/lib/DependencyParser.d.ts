import { ImportResourcePath } from './ImportResourcePath';
export declare class DependencyParser {
    private REGEX_CLEAN;
    private REGEX_DETECT_IMPORT;
    parseDependencies(source: string, parent: ImportResourcePath | string): ImportResourcePath[];
    private resolvePath;
}
