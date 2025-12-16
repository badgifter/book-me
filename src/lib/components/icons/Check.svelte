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
        d="M5 13l4 4L19 7"
    />
</svg>
