// Runs electron-vite with ELECTRON_RUN_AS_NODE out of the way.
//
// An editor's integrated terminal sets it, and electron then starts as node
// and opens no window. `env -u` did this before, which Windows has no answer
// for; node does the same thing on every platform.
import { spawn } from 'node:child_process'

delete process.env.ELECTRON_RUN_AS_NODE

const child = spawn('electron-vite', process.argv.slice(2), {
  stdio: 'inherit',
  // npm run puts node_modules/.bin on PATH; the shell finds it there.
  shell: true
})

child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)))
