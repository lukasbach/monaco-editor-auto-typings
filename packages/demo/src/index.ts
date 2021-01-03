import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { languages, Uri } from 'monaco-editor/esm/vs/editor/editor.api';
// @ts-ignore
import untar from 'js-untar';
import ModuleResolutionKind = languages.typescript.ModuleResolutionKind;
import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings';

const val = `import * as monaco from 'monaco-editor'
import { BigIntEntityInterface, UncomplexEntityInterface } from "uncomplex";
import React from 'react';

const x = BigIntEntityInterface;
const y: UncomplexEntityInterface = {
  entityId: 'asd'
}`;

const editor = monaco.editor.create(document.getElementById('root')!, {
  model: monaco.editor.createModel(val, 'typescript', /*Uri.parse('file://root/index.ts')*/),
});

// monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
//   ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
//   moduleResolution: ModuleResolutionKind.NodeJs,
//   allowSyntheticDefaultImports: true
// });

const autoTypings = AutoTypings.create(editor, {
  // fileRootPath: 'file://root/',
  sourceCache: new LocalStorageCache(),
  onUpdate: (u, t) => console.log(t),
  onError: e => console.error(e),
});