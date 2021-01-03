import { SourceCache } from './SourceCache';
import { SourceResolver } from './SourceResolver';

export interface Options {
  /** Share source cache between multiple editor instances by storing the cache in a static property. */
  shareCache: boolean;

  /** Only use packages specified in the `versions` property. */
  onlySpecifiedPackages: boolean;

  /** Load typings from prespecified versions when initializing. */
  preloadPackages: boolean;

  dontAdaptEditorOptions: boolean;

  versions?: { [packageName: string]: string };

  onUpdateVersions?: (versions: { [packageName: string]: string }) => void;

  sourceCache: SourceCache;

  sourceResolver: SourceResolver;

  /** The root directory where your edited files are. Must end with a slash. Defaults to "inmemory://model/" */
  fileRootPath: string;

  debounceDuration: number;
}