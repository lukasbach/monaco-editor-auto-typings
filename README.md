# monaco-editor-auto-typings

# Example

```typescript
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings';

const val = `
import React from 'react';
React.useEffect(0); // Type Error!
`;

// Create monaco editor instance
const editor = monaco.editor.create(document.getElementById('root')!, {
  model: monaco.editor.createModel(val, 'typescript'),
});

// Initialize auto typing on monaco editor. Imports will now automatically be typed!
const autoTypings = AutoTypings.create(editor, {
  sourceCache: new LocalStorageCache(), // Cache loaded sources in localStorage. May be omitted
  // Other options...
});
```

## Configuration

```typescript
export interface Options {
  /**
   * Share source cache between multiple editor instances by storing
   * the cache in a static property.
   *
   * Defaults to false.
   */
  shareCache: boolean;

  /**
   * Only use packages specified in the `versions` property.
   *
   * Defaults to false.
   */
  onlySpecifiedPackages: boolean;

  /**
   * Load typings from prespecified versions when initializing. Versions
   * need to be specified in the ``versions`` option.
   *
   * Defaults to false.
   */
  preloadPackages: boolean;

  /**
   * Updates compiler options to defaults suitable for auto-loaded
   * declarations, specifically by setting ``moduleResolution`` to
   * ``NodeJs`` and ``allowSyntheticDefaultImports`` to true.
   * Other options are not changed. Set this property to true to
   * disable this behaviour.
   *
   * Defaults to false.
   */
  dontAdaptEditorOptions: boolean;

  /**
   * After typings were resolved and injected into monaco, auto-typings
   * updates the value of the current model to trigger a refresh in
   * monaco's typing logic, so that it uses the injected typings.
   */
  dontRefreshModelValueAfterResolvement: boolean;

  /**
   * Prespecified package versions. If a package is loaded whose
   * name is specified in this object, it will load with the exact
   * version specified in the object.
   *
   * Setting the option ``onlySpecifiedPackages`` to true makes this
   * property act as a whitelist for packages.
   *
   * Setting the option ``preloadPackages`` makes the packages specified
   * in this property load directly after initializing the auto-loader.
   */
  versions?: { [packageName: string]: string };

  /**
   * If a new package was loaded, its name and version is added to the
   * version object, and this method is called with the updated object.
   * @param versions updated versions object.
   */
  onUpdateVersions?: (versions: { [packageName: string]: string }) => void;

  /**
   * Supply a cache where declaration files and package.json files are
   * cached to. Supply an instance of {@link LocalStorageCache} to cache
   * files to localStorage.
   */
  sourceCache: SourceCache;

  /**
   * Supply a custom resolver logic for declaration and package.json files.
   * Defaults to {@link UnpkgSourceResolver}. Not recommended to change.
   */
  sourceResolver: SourceResolver;

  /**
   * The root directory where your edited files are. Must end with
   * a slash. The default is suitable unless you change the default
   * URI of files loaded in the editor.
   *
   * Defaults to "inmemory://model/"
   */
  fileRootPath: string;

  /**
   * Debounces code reanalyzing after user has changed the editor contents
   * by the specified amount. Set to zero to disable. Value provided in
   * milliseconds.
   *
   * Defaults to 4000, i.e. 4 seconds.
   */
  debounceDuration: number;

  /**
   * Maximum recursion depth for recursing packages. Determines how many
   * nested package declarations are loaded. For example, if ``packageRecursionDepth``
   * has the value 2, the code in the monaco editor references packages ``A1``, ``A2``
   * and ``A3``, package ``A1`` references package ``B1`` and ``B1`` references ``C1``,
   * then packages ``A1``, ``A2``, ``A3`` and ``B1`` are loaded. Set to zero to
   * disable.
   *
   * Defaults to 3.
   */
  packageRecursionDepth: number;

  /**
   * Maximum recursion depth for recursing files. Determines how many
   * nested file declarations are loaded. The same as ``packageRecursionDepth``,
   * but for individual files. Set to zero to disable.
   *
   * Defaults to 10.
   */
  fileRecursionDepth: number;

  /**
   * Called after progress updates like loaded declarations or events.
   * @param update detailed event object containing update infos.
   * @param textual a textual representation of the update for debugging.
   */
  onUpdate?: (update: ProgressUpdate, textual: string) => void;

  /**
   * Called if errors occur.
   * @param error a textual representation of the error.
   */
  onError?: (error: string) => void;
}
```