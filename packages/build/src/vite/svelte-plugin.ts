import type { Plugin } from 'vite';

/**
 * Vite plugin that automatically excludes @embedpdf Svelte packages from dependency optimization.
 * This is necessary because Svelte 5 runes ($state, $effect) must be compiled within the 
 * consuming app's build process to maintain proper reactive context.
 * 
 * @example
 * ```ts
 * import { embedPdfSvelte } from '@embedpdf/build/vite';
 * 
 * export default defineConfig({
 *   plugins: [sveltekit(), embedPdfSvelte()]
 * });
 * ```
 */
export function embedPdfSvelte(): Plugin {
  return {
    name: 'vite-plugin-embedpdf-svelte',
    config(config) {
      // List of @embedpdf packages that have Svelte source exports
      const embedPdfPackages = [
        '@embedpdf/core',
        '@embedpdf/engines',
        '@embedpdf/plugin-interaction-manager',
        '@embedpdf/plugin-loader',
        '@embedpdf/plugin-render',
        '@embedpdf/plugin-scroll',
        '@embedpdf/plugin-tiling',
        '@embedpdf/plugin-viewport',
        '@embedpdf/plugin-zoom',
      ];

      return {
        optimizeDeps: {
          exclude: [
            ...(config.optimizeDeps?.exclude || []),
            ...embedPdfPackages,
          ],
        },
      };
    },
  };
}
