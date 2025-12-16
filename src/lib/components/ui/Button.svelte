<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";
    import Icon from "./Icon.svelte";

    let {
        children,
        variant = "primary",
        class: className = "",
        disabled = false,
        loading = false,
        ...rest
    }: HTMLButtonAttributes & {
        variant?: "primary" | "secondary" | "outline" | "ghost";
        loading?: boolean;
    } = $props();

    const baseStyles =
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md",
        secondary:
            "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
        outline:
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    };
</script>

<button
    class="{baseStyles} {variants[variant]} {className}"
    {disabled}
    {...rest}
>
    {#if loading}
        <Icon
            name="spinner"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        />
    {/if}
    {@render children?.()}
</button>
