import { SourceCache } from './SourceCache';

export class DummySourceCache implements SourceCache {
  public getFile(uri: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  public isFileAvailable(uri: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  public storeFile(uri: string, content: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  public clear(): Promise<void> {
    return Promise.resolve(undefined);
  }
}