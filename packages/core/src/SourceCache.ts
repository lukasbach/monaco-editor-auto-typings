export interface SourceCache {
  isFileAvailable?: (uri: string) => Promise<boolean>;
  storeFile: (uri: string, content: string) => Promise<void>;
  getFile: (uri: string) => Promise<string | undefined>;
  clear: () => Promise<void>;
}
