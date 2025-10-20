<script lang="ts">

    import {useSelectionCapability} from "../hooks/use-selection";

    let { provides: sel} = $derived(useSelectionCapability())

    $effect(() => {
        if(!sel) return;
        return sel.onCopyToClipboard((text) => {
            navigator.clipboard.writeText(text);
        })
    })
</script>