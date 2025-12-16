<script lang="ts">
    import { onMount } from "svelte";

    let { name, class: className = "", ...rest } = $props();

    // Define available icons for type safety / strict mapping if desired, but for now we dynamic load
    const icons: Record<string, () => Promise<any>> = {
        "left-chevron": () => import("../icons/ChevronLeft.svelte"),
        "right-chevron": () => import("../icons/ChevronRight.svelte"),
        spinner: () => import("../icons/Spinner.svelte"),
        check: () => import("../icons/Check.svelte"),
        calendar: () => import("../icons/Calendar.svelte"),
        clock: () => import("../icons/Clock.svelte"),
        video: () => import("../icons/Video.svelte"),
    };

    let IconComponent = $state<any>(null);

    $effect(() => {
        if (icons[name]) {
            icons[name]().then((mod) => {
                IconComponent = mod.default;
            });
        } else {
            console.warn(`Icon "${name}" not found`);
        }
    });
</script>

{#if IconComponent}
    <IconComponent class={className} {...rest} />
{/if}
