<script lang="ts">
    import {useSelectionCapability} from "../hooks";

    let { provides: sel} = $derived(useSelectionCapability())

    $effect(() => {
        if(!sel) return;
        return sel.onCopyToClipboard((text) => {
            navigator.clipboard.writeText(text);
        })
    })
</script>