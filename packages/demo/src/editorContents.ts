export const editorContents = `import fetch from 'node-fetch'
import React from 'react'
import { LocalStorageCache } from 'monaco-editor-auto-typings'

// Works fine
fetch('https://google.com', { method: 'GET' })
React.useEffect(() => {})
React.useState<string>('Hello')
new LocalStorageCache().getFile('FILE_ID')

// Type errors are detected! :)
fetch(1337) // Shouldn't be a number!
React.useEffect('I\`m not a function!')
React.useState<number>('Not a number :s')
new LocalStorageCache().getFile() // Argument missing!`;
