<script lang="ts">
	import '../app.css';
	import Menu from '$lib/components/menu.svelte';
	import { afterNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	let { children } = $props();

	afterNavigate(() => {
		// TODO scroll to top
	});
</script>

<div>
	<Menu />
	<Header />
	{@render children()}
</div>
