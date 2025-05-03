<script lang="ts">
	import '../../app.css';
	import { onMount, type Component } from 'svelte';
	import Frieze1Part1 from '$lib/friezes/Frieze1Part1.svelte';
	import Frieze1Part2 from '$lib/friezes/Frieze1Part2.svelte';
	import Frieze1Part3 from '$lib/friezes/Frieze1Part3.svelte';
	import Frieze1Part4 from '$lib/friezes/Frieze1Part4.svelte';
	import Frieze1Part5 from '$lib/friezes/Frieze1Part5.svelte';
	import Frieze1Part6 from '$lib/friezes/Frieze1Part6.svelte';

	const friezes: Array<Component> = [
		Frieze1Part1,
		Frieze1Part2,
		Frieze1Part3,
		Frieze1Part4,
		Frieze1Part5,
		Frieze1Part6
	];
	let SelectedFrieze: Component;

	onMount(() => {
		const idx = Math.floor(Math.random() * friezes.length);
		SelectedFrieze = friezes[idx];
	});
</script>

<div>
	<div class="svg-container">
		{#if SelectedFrieze}
			<svelte:component this={SelectedFrieze} />
		{/if}
	</div>
	<slot />
	<div class="svg-container">
		{#if SelectedFrieze}
			<svelte:component this={SelectedFrieze} />
		{/if}
	</div>
</div>
