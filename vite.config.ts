import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],

	resolve: {
		conditions: ['browser']
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/lib/server/**'],
		alias: {
			$lib: '/src/lib'
		}
	}
});
