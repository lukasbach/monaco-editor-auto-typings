import { ImportResourcePath } from './ImportResourcePath';
import * as path from 'path';

export class DependencyParser {
  private REGEX_CLEAN = /[\n|\r]/g;
  // private REGEX_DETECT_IMPORT = /(?:(?:(?:import)|(?:export))(?:.)*?from\s+["']([^"']+)["'])|(?:\/+\s+<reference\s+path=["']([^"']+)["']\s+\/>)/g;
  private REGEX_DETECT_IMPORT = /(?:(?:(?:import)|(?:export))(?:\s+(type)\s+)?(?:.)*?from\s+["']([^"']+)["'])|(?:\/+\s+<reference\s+path=["']([^"']+)["']\s+\/>)/g;

  public parseDependencies(source: string, parent: ImportResourcePath | string): ImportResourcePath[] {
    const cleaned = source; // source.replace(this.REGEX_CLEAN, '');

    const result = [ ...cleaned.matchAll(this.REGEX_DETECT_IMPORT) ]
    console.log( 'REGEX_DETECT_IMPORT', result)
    
    return result
      .map(x => ({ path: x[2] ?? x[3], isTypeOnly: x[1]!==undefined }) )
      .filter( x => !!x.path )
      .map(x => {
        const result = this.resolvePath(x.path, x.isTypeOnly, parent);
        return result;
      });
  }

  private resolvePath(importPath: string, isTypeOnly:boolean, parent: ImportResourcePath | string): ImportResourcePath {
    if (typeof parent === 'string') {
      if (importPath.startsWith('.')) {
        return {
          kind: 'relative',
          importPath,
          sourcePath: parent,
        };
      } else if (importPath.startsWith('@')) {
        const segments = importPath.split('/');
        return {
          kind: 'package',
          packageName: `${segments[0]}/${segments[1]}`,
          importPath: segments.slice( 2 ).join('/'),
          isTypeOnly: isTypeOnly
        };
      } else {
        const segments = importPath.split('/');
        return {
          kind: 'package',
          packageName: segments[0],
          importPath: segments.slice(1).join('/'),
          isTypeOnly: isTypeOnly
        };
      }
    } else {
      switch (parent.kind) {
        case 'package':
          throw Error('TODO?');
        case 'relative':
          throw Error('TODO2?');
        case 'relative-in-package':
          if (importPath.startsWith('.')) {
            return {
              kind: 'relative-in-package',
              packageName: parent.packageName,
              sourcePath: path.join(parent.sourcePath, parent.importPath),
              importPath: importPath,
              isTypeOnly: isTypeOnly
            };
          } else if (importPath.startsWith('@')) {
            const segments = importPath.split('/');
            return {
              kind: 'package',
              packageName: `${segments[0]}/${segments[1]}`,
              importPath: segments.slice(2).join('/'),
              isTypeOnly: isTypeOnly
            };
          } else {
            const segments = importPath.split('/');
            return {
              kind: 'package',
              packageName: segments[0],
              importPath: segments.slice(1).join('/'),
              isTypeOnly: isTypeOnly
            };
          }
      }
    }
  }
}
