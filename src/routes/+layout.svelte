<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.png";
	// Could set in html head directly

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
