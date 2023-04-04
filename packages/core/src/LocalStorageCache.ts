import { SourceCache } from './SourceCache';

export class LocalStorageCache implements SourceCache {
  public static LOCALSTORAGE_PREFIX = '__autotyper_cache_';
  private localCache: Record<string, string> = {};

  public async getFile(uri: string): Promise<string | undefined> {
    try {
      return localStorage.getItem(LocalStorageCache.LOCALSTORAGE_PREFIX + uri) ?? undefined;
    } catch (e) {
      return this.localCache[uri];
    }
  }

  public async storeFile(uri: string, content: string): Promise<void> {
    this.localCache[uri] = content;
    try {
      localStorage.setItem(LocalStorageCache.LOCALSTORAGE_PREFIX + uri, content);
    } catch (e) {
      // Ignore
    }
  }

  public async clear(): Promise<void> {
    this.localCache = {};
    const foundKeys: string[] = [];

    for (var i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LocalStorageCache.LOCALSTORAGE_PREFIX)) {
        foundKeys.push(key);
      }
    }

    for (const key of foundKeys) {
      localStorage.removeItem(key);
    }
  }
}
