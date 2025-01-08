import { defineConfig } from 'vite'
import pkg from '../package.json'
import { resolve } from 'path'

const cliExport = pkg.exports['./cli']
const hasCLIExport = cliExport !== undefined

export default defineConfig({
  // Only build if CLI export exists
  build: hasCLIExport ? {
    outDir: 'dist/cli',
    lib: {
      entry: resolve(process.cwd(), cliExport.source),
      formats: ['es', 'cjs'],
      fileName: (format) => `cli.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    // Exclude dependencies from bundle
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ]
    }
  } : undefined,

  // Skip build if no CLI export
  plugins: [{
    name: 'conditional-build',
    buildStart() {
      if (!hasCLIExport) {
        console.log('No CLI export found in package.json, skipping build')
        process.exit(0)
      }
    }
  }]
})
