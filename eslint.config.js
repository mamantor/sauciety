import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig(
	{
		ignores: [
			'**/.svelte-kit/**',
			'**/.vercel/**',
			'**/.yarn/**',
			'**/build/**',
			'**/node_modules/**',
			'**/package/**'
		]
	},

	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,

	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.node,
				...globals.browser
			}
		}
	},

	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				extraFileExtensions: ['.svelte'],
				svelteConfig
			}
		}
	},

	eslintConfigPrettier,
	svelte.configs.prettier
);