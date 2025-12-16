<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    let {
        label,
        id,
        error,
        value = $bindable(),
        class: className = "",
        ...rest
    }: HTMLInputAttributes & {
        label?: string;
        error?: string;
        value?: any;
    } = $props();
</script>

<div class="space-y-1.5 {className}">
    {#if label}
        <label for={id} class="block text-sm font-medium text-gray-700">
            {label}
        </label>
    {/if}
    <div class="relative">
        <input
            {id}
            bind:value
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border
            {error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : ''}"
            {...rest}
        />
    </div>
    {#if error}
        <p class="text-sm text-red-600">{error}</p>
    {/if}
</div>
