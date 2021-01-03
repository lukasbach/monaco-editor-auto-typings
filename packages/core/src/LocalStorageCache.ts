import { SourceCache } from './SourceCache';

export class LocalStorageCache implements SourceCache {
  public static LOCALSTORAGE_PREFIX = '__autotyper_cache_';

  public async getFile(uri: string): Promise<string | undefined> {
    return localStorage.getItem(LocalStorageCache.LOCALSTORAGE_PREFIX + uri) ?? undefined;
  }

  public async storeFile(uri: string, content: string): Promise<void> {
    localStorage.setItem(LocalStorageCache.LOCALSTORAGE_PREFIX + uri, content);
  }

  public async clear(): Promise<void> {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LocalStorageCache.LOCALSTORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }
}