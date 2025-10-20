<script lang="ts">
  import { usePdfiumEngine } from '@embedpdf/engines/svelte';
  import {
    createPluginRegistration,
    type IPlugin,
    type PluginBatchRegistration,
  } from '@embedpdf/core';
  import { EmbedPDF } from '@embedpdf/core/svelte';
  import {
    AnnotationPlugin,
    AnnotationPluginPackage,
    type AnnotationTool,
  } from '@embedpdf/plugin-annotation';
  import { AnnotationLayer } from '@embedpdf/plugin-annotation/svelte';
  import { LoaderPluginPackage } from '@embedpdf/plugin-loader';
  import { ViewportPluginPackage } from '@embedpdf/plugin-viewport';
  import { SelectionLayer, SelectionPluginPackage } from '@embedpdf/plugin-selection/svelte';
  import { Viewport } from '@embedpdf/plugin-viewport/svelte';
  import { RenderPluginPackage } from '@embedpdf/plugin-render';
  import { Scroller, ScrollPluginPackage } from '@embedpdf/plugin-scroll/svelte';
  import { useLoaderCapability } from '@embedpdf/plugin-loader/svelte';
  import {
    InteractionManagerPluginPackage,
    PagePointerProvider,
  } from '@embedpdf/plugin-interaction-manager/svelte';
  import { PdfAnnotationSubtype, type PdfStampAnnoObject, type Rotation } from '@embedpdf/models';
  import AnnotationToolbar from '$lib/components/AnnotationToolbar.svelte';
  import { RenderLayer } from '@embedpdf/plugin-render/svelte';

  type RenderPageProps = {
    width: number;
    height: number;
    pageIndex: number;
    scale: number;
    rotation: Rotation;
  };

  type PageProps = {
    withMarqueeZoom?: boolean;
  };
  let { withMarqueeZoom = false }: PageProps = $props();

  const { engine, isLoading } = $derived(usePdfiumEngine());
  const { provides: loaderProvides } = $derived(useLoaderCapability());
  let activeFileLoaded = $state(true);

  let plugins = $derived.by(() => {
    const basePlugins: PluginBatchRegistration<IPlugin<any>, any>[] = [
      createPluginRegistration(LoaderPluginPackage, {
        loadingOptions: {
          type: 'url',
          pdfFile: {
            id: '1',
            url: 'https://snippet.embedpdf.com/ebook.pdf',
          },
        },
      }),
      createPluginRegistration(ViewportPluginPackage),
      createPluginRegistration(ScrollPluginPackage),
      createPluginRegistration(RenderPluginPackage),
      // Dependencies for Annotation Plugin
      createPluginRegistration(InteractionManagerPluginPackage),
      createPluginRegistration(SelectionPluginPackage),
      // The Annotation Plugin
      createPluginRegistration(AnnotationPluginPackage, {
        annotationAuthor: 'EmbedPDF User',
      }),
    ];
    if (withMarqueeZoom) {
      basePlugins.splice(4, 0, createPluginRegistration(InteractionManagerPluginPackage));
    }
    return basePlugins;
  });

  async function handleDocChange(
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement;
    },
  ) {
    activeFileLoaded = false;
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file && loaderProvides) {
      const arrayBuffer = await file.arrayBuffer();
      await loaderProvides.loadDocument({
        type: 'buffer',
        pdfFile: {
          id: Math.random().toString(36).substring(2, 15),
          name: file.name,
          content: arrayBuffer,
        },
        options: {
          mode: 'full-fetch',
        },
      });
      activeFileLoaded = true;
    }
  }
</script>

{#snippet RenderPageSnippet(props: RenderPageProps)}
  <div style:width={`${props.width}`} style:height={`${props.height}`} style:position="relative">
    {#if activeFileLoaded}
      <PagePointerProvider
        pageIndex={props.pageIndex}
        pageWidth={props.width}
        pageHeight={props.height}
        rotation={props.rotation}
        scale={props.scale}
      >
        <RenderLayer pageIndex={props.pageIndex} scale={props.scale}   class="pointer-events-none"/>
        <SelectionLayer pageIndex={props.pageIndex} scale={props.scale} />
        <!-- Annotation Layer on top -->
        <AnnotationLayer
          pageIndex={props.pageIndex}
          scale={props.scale}
          pageWidth={props.width}
          pageHeight={props.height}
          rotation={props.rotation}
        />
      </PagePointerProvider>
    {/if}
  </div>
{/snippet}

{#if !engine || isLoading}
  <div>loading...</div>
{:else}
  <div id="view-page" class="flex flex-1 flex-col overflow-hidden">
    <EmbedPDF
      {engine}
      {plugins}
      onInitialized={async (registry) => {
        const annotation = registry.getPlugin<AnnotationPlugin>('annotation')?.provides();
        annotation?.addTool<AnnotationTool<PdfStampAnnoObject>>({
          id: 'stampCheckmark',
          name: 'Checkmark',
          interaction: {
            exclusive: false,
            cursor: 'crosshair',
          },
          matchScore: () => 0,
          defaults: {
            type: PdfAnnotationSubtype.STAMP,
            imageSrc: '/circle-checkmark.svg',
            imageSize: { width: 30, height: 30 },
          },
        });

        annotation?.addTool<AnnotationTool<PdfStampAnnoObject>>({
          id: 'stampCross',
          name: 'Cross',
          interaction: {
            exclusive: false,
            cursor: 'crosshair',
          },
          matchScore: () => 0,
          defaults: {
            type: PdfAnnotationSubtype.STAMP,
            imageSrc: '/x.svg',
            imageSize: { width: 30, height: 30 },
          },
        });
      }}
    >
      <div class="flex h-full flex-col">
        <AnnotationToolbar />
        <Viewport class="h-full w-full flex-1 overflow-auto bg-transparent select-none">
          <input type="file" accept="application/pdf" onchange={handleDocChange} />
          <Scroller {RenderPageSnippet} />
        </Viewport>
      </div>
    </EmbedPDF>
  </div>
{/if}
