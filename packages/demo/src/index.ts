import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { languages, Uri } from 'monaco-editor/esm/vs/editor/editor.api';
// @ts-ignore
import untar from 'js-untar';
import ModuleResolutionKind = languages.typescript.ModuleResolutionKind;
import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings';

/*
import * as y from "./abc"
import {X} from './dep';
import * as z from "@blueprintjs/core"
 */
const val = `import * as monaco from 'monaco-editor'
import { BigIntEntityInterface, UncomplexEntityInterface } from "uncomplex";
import React from 'react';


const editor = monaco.editor.create(document.getElementById('root')!, {
  value: 'console.log("Hello, world")',
  language: 'javascript',
});

const x = BigIntEntityInterface;
const y: UncomplexEntityInterface = {
  entityId: 'asd'
}`;

const editor = monaco.editor.create(document.getElementById('root')!, {
  model: monaco.editor.createModel(val, 'typescript', Uri.parse('file://root/index.ts')),
});

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
  moduleResolution: ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true
});


const autoTypings = AutoTypings.create(editor, {
  fileRootPath: 'file://root/',
  sourceCache: new LocalStorageCache()
});

// const addModelFromUnpkg = async (url: string, uri: string, language = 'typescript') => {
//   const val = await (await fetch(url, { method: 'GET'})).text();
//   console.log(`Adding ${uri}...`)
//   try {
//     monaco.editor.createModel(val, 'typescript', Uri.parse(uri));
//   } catch(e) {
//     console.error(e);
//     console.log(monaco.editor.getModels().map(m => m.uri.toString()))
//   }
// }
//
// setTimeout(async () => {
//   await addModelFromUnpkg(`https://unpkg.com/uncomplex@1.0.0/package.json`, `file://root/node_modules/uncomplex/package.json`, 'json');
//   await addModelFromUnpkg(`https://unpkg.com/uncomplex@1.0.0/lib/index.d.ts`, `file://root/node_modules/uncomplex/lib/index.d.ts`);
//   await addModelFromUnpkg(`https://unpkg.com/uncomplex@1.0.0/lib/entityInterfaces/index.d.ts`, `file://root/node_modules/uncomplex/lib/entityInterfaces/index.ts`);
//   await addModelFromUnpkg(`https://unpkg.com/uncomplex@1.0.0/lib/entityInterfaces/BigIntEntityInterface.d.ts`, `file://root/node_modules/uncomplex/lib/entityInterfaces/BigIntEntityInterface.ts`);
//   await addModelFromUnpkg(`https://unpkg.com/uncomplex@1.0.0/lib/UncomplexEntityInterface.d.ts`, `file://root/node_modules/uncomplex/lib/UncomplexEntityInterface.ts`);
// }, 500)

editor.onDidChangeModelContent(e => {
  console.log(editor.getModel()?.uri)

  const imports = editor.getModel()?.getLinesContent()
    .filter(l => /import(.)*from\s+["']([^"']+)["']/.exec(l))
    .map(l => /import(.)*from\s+["']([^"']+)["']/.exec(l)![2])
    .filter(l => !l.startsWith('.'))
    .forEach(async importName => {
      const data = await fetch(`https://unpkg.com/uncomplex@1.0.0/lib/index.d.ts`, { method: 'GET'});
      console.log("!")
      // monaco.editor.createModel(
      //   'export const X = 1;',
      //   'typescript', Uri.parse('file://root/dep.ts')
      // );
      console.log("!")


      /*monaco.editor.createModel(
        await (await fetch(`https://unpkg.com/uncomplex@1.0.0/package.json`, { method: 'GET'})).text(),
        'typescript', Uri.parse('file://root/node_modules/uncomplex/package.json')
      );
      console.log("!")
      monaco.editor.createModel(
        await (await fetch(`https://unpkg.com/uncomplex@1.0.0/lib/index.d.ts`, { method: 'GET'})).text(),
        'typescript', Uri.parse('file://root/node_modules/uncomplex/lib/index.ts')
      );
      console.log("!")
      monaco.editor.createModel(
        await (await fetch(`https://unpkg.com/uncomplex@1.0.0/lib/entityInterfaces/index.d.ts`, { method: 'GET'})).text(),
        'typescript', Uri.parse('file://root/node_modules/uncomplex/lib/entityInterfaces/index.ts')
      );
      console.log("!")
      monaco.editor.createModel(
        await (await fetch(`https://unpkg.com/uncomplex@1.0.0/lib/entityInterfaces/BigIntEntityInterface.d.ts`, { method: 'GET'})).text(),
        'typescript', Uri.parse('file://root/node_modules/uncomplex/lib/entityInterfaces/BigIntEntityInterface.ts')
      );
      console.log("!")
      monaco.editor.createModel(
        await (await fetch(`https://unpkg.com/uncomplex@1.0.0/lib/UncomplexEntityInterface.d.ts`, { method: 'GET'})).text(),
        'typescript', Uri.parse('file://root/node_modules/uncomplex/UncomplexEntityInterface.ts')
      );*/
      console.log(monaco.editor.getModels().map(m => m.uri.toString()))
    });

})