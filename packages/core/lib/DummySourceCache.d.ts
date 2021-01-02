import { SourceCache } from './SourceCache';
export declare class DummySourceCache implements SourceCache {
    getFile(uri: string): Promise<string | undefined>;
    isFileAvailable(uri: string): Promise<boolean>;
    storeFile(uri: string, content: string): Promise<void>;
}
