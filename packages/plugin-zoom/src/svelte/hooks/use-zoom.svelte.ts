import { initialState, ZoomPlugin, ZoomState } from '@embedpdf/plugin-zoom';
import { useCapability, usePlugin } from '@embedpdf/core/svelte';

export const useZoomCapability = () => useCapability<ZoomPlugin>(ZoomPlugin.id);
export const useZoomPlugin = () => usePlugin<ZoomPlugin>(ZoomPlugin.id);

export function useZoom() {
  const capability = useZoomCapability();
  let state = $state<ZoomState>(initialState);

  $effect(() => {
    const provides = capability.provides;
    if (!provides) return;
    
    return provides.onStateChange((newState) => {
      state = newState;
    });
  });

  return {
    get state() {
      return state;
    },
    get provides() {
      return capability.provides;
    },
  };
}
