export const editorContents = `import fetch from 'node-fetch'
import React from 'react'
import * as math from 'mathjs'

// Works fine
fetch('https://google.com', { method: 'GET' })
React.useEffect(() => {})
React.useState<string>('Hello')
math.derivative('x^2 + x', 'x')

// Type errors are detected! :)
fetch(1337) // Shouldn't be a number!
React.useEffect('I\`m not a function!')
React.useState<number>('Not a number :s')
math.derivative('x^2 + x') // Error, argument missing!`;
