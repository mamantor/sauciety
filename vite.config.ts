import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		modules: {
		  scopeBehaviour: 'local', // Use 'local' scope for CSS Modules
		  generateScopedName: '[name]__[local]__[hash:base64:5]', // Optional: customize class name format
		},
		preprocessorOptions: {
		  scss: {
			// Include global SCSS variables or mixins if needed
			additionalData: `@use '$lib/styles/global.scss';`,
		  },
		},
	  },
});
