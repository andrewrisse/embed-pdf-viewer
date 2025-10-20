<script lang="ts">
  import { useSelectionPlugin } from '../hooks';
  import type { Rect } from '@embedpdf/models';

  type Props = {
    pageIndex: number;
    scale: number;
    background?: string;
  };

  let { pageIndex, scale, background = 'rgba(33,150,243)' }: Props = $props();

  let { plugin: selPlugin } = $derived(useSelectionPlugin());
  let rects = $state<Rect[]>([]);
  let boundingRect = $state<Rect | null>(null);

  $effect(() => {
    if (!selPlugin) return;

    return selPlugin.registerSelectionOnPage({
      pageIndex,
      onRectsChange: ({ rects: newRects, boundingRect: newBoundingRect }) => {
        rects = newRects;
        boundingRect = newBoundingRect;
      },
    });
  });
</script>

{#if boundingRect}
  <div
    style:position="absolute"
    style:left={`${boundingRect.origin.x * scale}px`}
    style:top={`${boundingRect.origin.y * scale}px`}
    style:width={`${boundingRect.size.width * scale}px`}
    style:height={`${boundingRect.size.height * scale}px`}
    style:mix-blend-mode="multiply"
    style:isolation="isolate"
  >
    {#each rects as b, i (i)}
      <div
        style:position="absolute"
        style:left={`${(b.origin.x - boundingRect.origin.x) * scale}px`}
        style:top={`${(b.origin.y - boundingRect.origin.y) * scale}px`}
        style:width={`${b.size.width * scale}px`}
        style:height={`${b.size.height * scale}px`}
        style:background
        style:pointer-events="none"
      ></div>
    {/each}
  </div>
{/if}
