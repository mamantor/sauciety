<script lang="ts">
	import '../app.css';
	import Menu from '$lib/components/menu.svelte';
	import { afterNavigate } from '$app/navigation';
	let { children } = $props();

	afterNavigate(() => {
		// TODO scroll to top
	});
</script>

<div>
	<Menu/>
	{@render children()}
</div>
