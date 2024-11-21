import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { AutoTypings, JsDelivrSourceResolver, LocalStorageCache, UnpkgSourceResolver } from 'monaco-editor-auto-typings';
import { editorContents } from './editorContents';

import './style.css';

const editor = monaco.editor.create(document.getElementById('editor-mountpoint')!, {
  model: monaco.editor.createModel(editorContents, 'typescript' /*Uri.parse('file://root/index.ts')*/),
});

const cache = new LocalStorageCache();

AutoTypings.create(editor, {
  // Cache declaration files to local storage
  sourceCache: cache,

  sourceResolver: new JsDelivrSourceResolver(),

  // Log progress updates to a div console
  onUpdate: (u, t) => {
    const mountPoint = document.getElementById('logs-mountpoint')!;
    const log = document.createElement('div');
    log.innerHTML = t;
    mountPoint.appendChild(log);
    mountPoint.scrollTop = mountPoint.scrollHeight;
  },

  // Log errors to a div console
  onError: e => {
    const mountPoint = document.getElementById('logs-mountpoint')!;
    const log = document.createElement('div');
    log.classList.add('err');
    log.innerHTML = e;
    mountPoint.appendChild(log);
    mountPoint.scrollTop = mountPoint.scrollHeight;
  },

  // Print loaded versions to DOM
  onUpdateVersions: versions => {
    document.getElementById('versions-mountpoint')!.innerHTML = Object.entries(versions)
      .map(v => `<div>${v[0]}: ${v[1]}</div>`)
      .join('');
  },
});

document.getElementById('reset-cache')!.onclick = () => cache.clear();
