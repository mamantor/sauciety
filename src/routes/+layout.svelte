<script lang="ts">
	import '../app.css';
	import Menu from '$lib/components/Menu/menu.svelte';
	import { afterNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	let { children } = $props();

	afterNavigate(() => {
		// TODO scroll to top
	});
</script>

<svelte:head>
	<title>Turbo Tonio Sauciety</title>
</svelte:head>

<div>
	<Menu />
	<Header />
	{@render children()}
</div>
