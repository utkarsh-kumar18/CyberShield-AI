import react from '@vitejs/plugin-react'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, join } from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'

function openInChrome() {
  return {
    name: 'open-in-chrome',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer.address()
        const host = typeof address === 'object' && address?.address !== '0.0.0.0'
          ? address.address
          : '127.0.0.1'
        const url = `http://${host}:${address.port}/`
        const candidates = [
          process.env.CHROME_PATH,
          join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
          join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
          join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'Google', 'Chrome', 'Application', 'chrome.exe'),
          ...((process.env.PATH || '').split(delimiter).map((directory) => join(directory, 'chrome.exe'))),
        ].filter(Boolean)
        const chrome = candidates.find((candidate) => existsSync(candidate))

        if (!chrome) {
          const located = spawnSync('where.exe', ['chrome'], { encoding: 'utf8', windowsHide: true })
          const discovered = located.status === 0 ? located.stdout.trim().split(/\r?\n/)[0] : null
          if (discovered) candidates.unshift(discovered)
        }

        const executable = candidates.find((candidate) => existsSync(candidate))
        if (!executable) {
          console.warn('Chrome was not found. Open this URL manually:', url)
          return
        }

        const browser = spawn(executable, [url], { detached: true, stdio: 'ignore', windowsHide: true })
        browser.on('error', (error) => console.error('Could not open Chrome:', error.message))
        browser.unref()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), openInChrome()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: false,
      },
    },
  },
})
