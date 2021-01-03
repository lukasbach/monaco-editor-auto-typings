import { SourceCache } from './SourceCache';
import * as fs from 'fs';
import * as path from 'path';

export class FileSystemCache implements SourceCache {
  constructor(private basePath: string) {}

  public getFile(uri: string): Promise<string | undefined> {
    try {
      return fs.promises.readFile(path.join(this.basePath, this.simplifyUri(uri)), { encoding: 'utf8' });
    } catch (e) {
      return Promise.resolve(undefined);
    }
  }

  public async clear(): Promise<void> {
    for (const file of await fs.promises.readdir(this.basePath)) {
      await fs.promises.unlink(path.join(this.basePath, file));
    }
  }

  public storeFile(uri: string, content: string): Promise<void> {
    return fs.promises.writeFile(path.join(this.basePath, this.simplifyUri(uri)), content);
  }

  private simplifyUri(uri: string) {
    return uri.replace(/\//g, '_').replace(/@/g, '___');
  }
}
