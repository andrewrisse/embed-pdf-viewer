# Svelte Setup Guide

## Why is this necessary?

When using @embedpdf packages with Svelte 5, the source files containing runes (`$state`, `$effect`) must be compiled **within your app's build process** to maintain proper reactive context. Pre-built files lose this context and cause `effect_orphan` errors.

The `"svelte"` export condition in package.json tells Vite to use source files, but Vite's dependency optimization tries to pre-bundle them, which breaks Svelte compilation.

## Solution

Use the `embedPdfSvelte()` Vite plugin to automatically exclude @embedpdf packages from dependency optimization:

### Installation

The plugin is included in `@embedpdf/build` (a dev dependency you likely already have).

### Usage

In your `vite.config.ts`:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { embedPdfSvelte } from '@embedpdf/build/vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    embedPdfSvelte() // Add this line
  ]
});
```

That's it! The plugin automatically configures:

```ts
{
  optimizeDeps: {
    exclude: [
      '@embedpdf/core',
      '@embedpdf/engines',
      '@embedpdf/plugin-loader',
      '@embedpdf/plugin-interaction-manager',
      '@embedpdf/plugin-render',
      '@embedpdf/plugin-scroll',
      '@embedpdf/plugin-tiling',
      '@embedpdf/plugin-viewport',
      '@embedpdf/plugin-zoom'
    ]
  }
}
```

## Alternative: Manual Configuration

If you prefer not to use the plugin, you can manually add the `optimizeDeps.exclude` configuration shown above to your `vite.config.ts`.
