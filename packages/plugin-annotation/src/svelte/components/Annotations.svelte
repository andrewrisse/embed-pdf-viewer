<!-- Annotations.svelte -->
<script lang="ts">
    import { blendModeToCss, PdfAnnotationObject, PdfBlendMode } from '@embedpdf/models';
    import {
        getAnnotationsByPageIndex,
        getSelectedAnnotationByPageIndex,
        isHighlight,
        isInk,
        isSquiggly,
        isCircle,
        isStrikeout,
        isUnderline,
        type TrackedAnnotation,
        isSquare,
        isLine,
        isPolyline,
        isPolygon,
        isFreeText,
        isStamp,
    } from '@embedpdf/plugin-annotation';

    import type {PointerEventHandlers, PointerEventHandlersWithLifecycle} from '@embedpdf/plugin-interaction-manager';
    import { usePointerHandlers } from '@embedpdf/plugin-interaction-manager/svelte';
    import { useSelectionCapability } from '@embedpdf/plugin-selection/svelte';

    import { useAnnotationCapability } from '../hooks';

    import Highlight from './text-markup/Highlight.svelte';
    import Underline from './text-markup/Underline.svelte';
    import Strikeout from './text-markup/Strikeout.svelte';
    import Squiggly from './text-markup/Squiggly.svelte';
    import Ink from './annotations/Ink.svelte';
    import Square from './annotations/Square.svelte';
    import Circle from './annotations/Circle.svelte';
    import Line from './annotations/Line.svelte';
    import Polyline from './annotations/Polyline.svelte';
    import Polygon from './annotations/Polygon.svelte';
    import FreeText from './annotations/FreeText.svelte';
    import Stamp from './annotations/Stamp.svelte';
    import type {
        CustomAnnotationRenderer,
        ResizeHandleUI,
        SelectionMenu,
        VertexHandleUI
    } from "../types";
    import AnnotationContainer from "./AnnotationContainer.svelte";

    // ---------- props ----------
    interface AnnotationsProps {
        pageIndex: number;
        scale: number;
        rotation: number;
        pageWidth: number;
        pageHeight: number;
        selectionMenu?: SelectionMenu;
        resizeUI?: ResizeHandleUI;
        vertexUI?: VertexHandleUI;
        selectionOutlineColor?: string;
        customAnnotationRenderer?: CustomAnnotationRenderer<PdfAnnotationObject>;
    }
    let {
        pageIndex,
        scale,
        rotation,
        pageWidth,
        pageHeight,
        selectionMenu,
        resizeUI,
        vertexUI,
        selectionOutlineColor,
        customAnnotationRenderer
    }: AnnotationsProps = $props();

    // ---------- capabilities / handlers ----------
    const { provides: annotationProvides } = $derived(useAnnotationCapability());
    const { provides: selectionProvides } = $derived(useSelectionCapability());
    const { register } = $derived(usePointerHandlers({ pageIndex }));

    // ---------- local state ----------
    let annotations = $state<TrackedAnnotation[]>([]);
    let selectionState = $state<TrackedAnnotation | null>(null);
    let editingId = $state<string | null>(null);

    // subscribe to annotation state
    $effect(() => {
        if (!annotationProvides) return;
        const off = annotationProvides.onStateChange((state) => {
            annotations = getAnnotationsByPageIndex(state, pageIndex);
            selectionState = getSelectedAnnotationByPageIndex(state, pageIndex);
        });
        return () => off?.();
    });

    // pointer handlers (capture-down to deselect when clicking empty layer)
    const handlers: PointerEventHandlersWithLifecycle<MouseEvent> = {
        onPointerDown: (_: unknown, pe: PointerEvent) => {
            if (pe.target === pe.currentTarget && annotationProvides) {
                annotationProvides.deselectAnnotation();
                editingId = null;
            }
        }
    };

    // register pointer handlers
    $effect(() => register(handlers));

    // click/select logic shared across shapes
    function handleClick(e: MouseEvent | TouchEvent, annotation: TrackedAnnotation) {
        e.stopPropagation();
        if (annotationProvides && selectionProvides) {
            annotationProvides.selectAnnotation(pageIndex, annotation.object.id);
            selectionProvides.clear();
            if (annotation.object.id !== editingId) {
                editingId = null;
            }
        }
    }
</script>

{#each annotations as annotation (annotation.object.id)}
    {@const isSelected = selectionState?.object.id === annotation.object.id}
    {@const isEditing = editingId === annotation.object.id}
    {@const tool = annotationProvides?.findToolForAnnotation(annotation.object)}

    {#if isInk(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? true}
                isResizable={tool?.interaction.isResizable ?? true}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Ink {...obj} {isSelected} {scale} onClick={(e: PointerEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isSquare(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? true}
                isResizable={tool?.interaction.isResizable ?? true}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Square {...obj} {isSelected} {scale} onClick={(e: PointerEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isCircle(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? true}
                isResizable={tool?.interaction.isResizable ?? true}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Circle {...obj} {isSelected} {scale} onClick={(e: PointerEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isUnderline(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? false}
                isResizable={tool?.interaction.isResizable ?? false}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                zIndex={0}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Underline {...obj} {scale} onClick={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isStrikeout(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? false}
                isResizable={tool?.interaction.isResizable ?? false}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                zIndex={0}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Strikeout {...obj} {scale} onClick={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isSquiggly(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? false}
                isResizable={tool?.interaction.isResizable ?? false}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                zIndex={0}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Squiggly {...obj} {scale} onClick={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isHighlight(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? false}
                isResizable={tool?.interaction.isResizable ?? false}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                zIndex={0}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Multiply) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Highlight {...obj} {scale} onClick={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isLine(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? true}
                isResizable={tool?.interaction.isResizable ?? false}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                vertexConfig={{
        extractVertices: (a) => [a.linePoints.start, a.linePoints.end],
        transformAnnotation: (a, vertices) => ({
          ...a,
          linePoints: { start: vertices[0], end: vertices[1] }
        })
      }}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Line {...obj} {isSelected} {scale} onClick={(e: PointerEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isPolyline(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? true}
                isResizable={tool?.interaction.isResizable ?? false}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                vertexConfig={{
        extractVertices: (a) => a.vertices,
        transformAnnotation: (a, vertices) => ({ ...a, vertices })
      }}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Polyline {...obj} {isSelected} {scale} onClick={(e: PointerEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isPolygon(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? true}
                isResizable={tool?.interaction.isResizable ?? false}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                vertexConfig={{
        extractVertices: (a) => a.vertices,
        transformAnnotation: (a, vertices) => ({ ...a, vertices })
      }}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(obj)}
                <Polygon {...obj} {isSelected} {scale} onClick={(e: PointerEvent | TouchEvent) => handleClick(e, annotation)} />
            {/snippet}
        </AnnotationContainer>
    {:else if isFreeText(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={(tool?.interaction.isDraggable ?? true) && !isEditing}
                isResizable={tool?.interaction.isResizable ?? true}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                onDoubleClick={(e: MouseEvent) => { e.stopPropagation(); editingId = annotation.object.id; }}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(object)}
                <FreeText
                        {isSelected}
                        isEditing={isEditing}
                        annotation={{ ...annotation, object }}
                        pageIndex={pageIndex}
                        {scale}
                        onClick={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                />
            {/snippet}
        </AnnotationContainer>
    {:else if isStamp(annotation)}
        <AnnotationContainer
                trackedAnnotation={annotation}
                {selectionMenu}
                {isSelected}
                isDraggable={tool?.interaction.isDraggable ?? true}
                isResizable={tool?.interaction.isResizable ?? true}
                lockAspectRatio={tool?.interaction.lockAspectRatio ?? false}
                onSelect={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                style={{ mixBlendMode: blendModeToCss(annotation.object.blendMode ?? PdfBlendMode.Normal) }}
                {pageIndex} {scale} {rotation} {pageWidth} {pageHeight}
                {resizeUI} {vertexUI} {selectionOutlineColor} {customAnnotationRenderer}
        >
            {#snippet children(_object)}
                <Stamp
                        {isSelected}
                        annotation={annotation}
                        pageIndex={pageIndex}
                        {scale}
                        onClick={(e: MouseEvent | TouchEvent) => handleClick(e, annotation)}
                />
            {/snippet}
        </AnnotationContainer>
    {/if}
{/each}