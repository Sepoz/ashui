import { resolve } from 'node:path'
/// <reference types="vitest" />
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
	plugins: [dts({ include: ['src'], rollupTypes: true, entryRoot: 'src' })],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'Ashui',
			fileName: 'ashui',
			formats: ['es', 'cjs'],
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['tests/**/*.{test,spec}.ts'],
	},
})
