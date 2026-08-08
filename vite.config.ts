import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(),sveltekit()],
	server: {
		allowedHosts: ['sauciety.localtest.me'],
	},
	css: {
		modules: {
		  scopeBehaviour: 'local', // Use 'local' scope for CSS Modules
		  generateScopedName: '[name]__[local]__[hash:base64:5]', // Optional: customize class name format
		},
	  },
});
