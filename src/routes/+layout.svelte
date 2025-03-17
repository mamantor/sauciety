<script lang="ts">
	import '../app.css';
	import Menu from '$lib/components/menu.svelte';
	let { children } = $props();
</script>

<div>
	<Menu/>
	{@render children()}
</div>
