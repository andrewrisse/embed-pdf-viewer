<script lang="ts">
  import type { PdfStampAnnoObject } from '@embedpdf/models';
  import type { TrackedAnnotation } from '@embedpdf/plugin-annotation';
  import RenderAnnotation from '../render-annotation.svelte';

  interface StampProps {
    isSelected: boolean;
    annotation: TrackedAnnotation<PdfStampAnnoObject>;
    pageIndex: number;
    scale: number;
    onClick: (e: MouseEvent | TouchEvent) => void;
  }

  let { isSelected, annotation, pageIndex, scale, onClick }: StampProps = $props();
</script>

<div
  style="position: absolute; width: 100%; height: 100%; z-index: 2;"
  style:pointer-events={isSelected ? 'none' : 'auto'}
  style:cursor="pointer"
  on:pointerdown={onClick}
  on:touchstart={onClick}
>
  <RenderAnnotation
    {pageIndex}
    annotation={{ ...annotation.object, id: annotation.object.id }}
    scaleFactor={scale}
  />
</div>
