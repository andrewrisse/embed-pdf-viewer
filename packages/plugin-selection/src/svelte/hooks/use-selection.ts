import { SelectionPlugin } from '@embedpdf/plugin-selection';
import { useCapability, usePlugin } from '@embedpdf/core/svelte';

export const useSelectionCapability = () => useCapability<SelectionPlugin>(SelectionPlugin.id);
export const useSelectionPlugin = () => usePlugin<SelectionPlugin>(SelectionPlugin.id);
