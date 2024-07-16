import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import renderer from 'vite-plugin-electron-renderer'
import solid from 'vite-plugin-solid'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      renderer({
        resolve: {
          'electron-store': { type: 'cjs' }
        }
      })
    ]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      solid(),
      renderer({
        resolve: {
          'electron-store': { type: 'cjs' }
        }
      })
    ]
  }
})
