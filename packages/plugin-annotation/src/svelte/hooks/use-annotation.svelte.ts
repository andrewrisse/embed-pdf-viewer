import {
  AnnotationPlugin,
  AnnotationState,
  initialState,
} from '@embedpdf/plugin-annotation';
import { useCapability, usePlugin } from '@embedpdf/core/svelte';

export const useAnnotationPlugin = () => usePlugin<AnnotationPlugin>(AnnotationPlugin.id);
export const useAnnotationCapability = () => useCapability<AnnotationPlugin>(AnnotationPlugin.id);

export const useAnnotation = () => {
  const { provides } = $derived(useAnnotationCapability());
  let state = $state<AnnotationState>(initialState({ enabled: true }));

  $effect(() => {
    return provides?.onStateChange((action) => (state = action));
  });

  return {
    get state() {
      return state;
    },
    get provides() {
      return provides;
    },
  };
};
