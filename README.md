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