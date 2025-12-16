<script>
    let { class: className = "", ...rest } = $props();
</script>

<svg
    class={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...rest}
>
    <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7"
    />
</svg>
