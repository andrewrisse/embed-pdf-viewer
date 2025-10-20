<script lang="ts">
  import { useAnnotationCapability } from '@embedpdf/plugin-annotation/svelte';
  const { provides: annotationApi } = $derived(useAnnotationCapability());
  let activeTool = $state<string | null>(null);
  let canDelete = $state<boolean>(false);

  $effect(() => {
    if (!annotationApi) return;
    const unsub1 = annotationApi.onActiveToolChange((tool) => {
      activeTool = tool?.id ?? null;
    });
    const unsub2 = annotationApi.onStateChange((state) => {
      canDelete = !!state.selectedUid;
    });

    return () => {
      unsub1();
      unsub2();
    };
  });

  const handleDelete = () => {
    const selection = annotationApi?.getSelectedAnnotation();
    if (selection) {
      annotationApi?.deleteAnnotation(selection.object.pageIndex, selection.object.id);
    }
  };

  const tools = [
    { id: 'stampCheckmark', name: 'Checkmark (stamp)' },
    { id: 'stampCross', name: 'Cross (stamp)' },
    { id: 'ink', name: 'Pen' },
    { id: 'square', name: 'Square' },
    { id: 'highlight', name: 'Highlight' },
    { id: 'freeText', name: 'Freetext' },
  ];
</script>

<div
  class="mb-4 mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
>
  {#each tools as tool (tool.id)}
    <button
      onclick={() => annotationApi?.setActiveTool(activeTool === tool.id ? null : tool.id)}
      class={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
        activeTool === tool.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {tool.name}
    </button>
  {/each}
  <div class="h-6 w-px bg-gray-200"></div>
  <button
    onclick={handleDelete}
    disabled={!canDelete}
    class="rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
  >
    Delete Selected
  </button>
</div>
