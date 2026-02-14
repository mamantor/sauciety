<script lang="ts">
	import MenuRecipeItem from '$lib/components/MenuRecipeItem.svelte';

	let { category } = $props();

</script>

<section class="mb-8 last:mb-0">
	<div class="mb-4 flex items-center gap-4">
		<div class="h-px flex-1 bg-primary/30"></div>
		<h2 class="font-serif text-xl uppercase tracking-widest text-primary">
			{category._id || 'Autre'}
		</h2>
		<div class="h-px flex-1 bg-primary/30"></div>
	</div>
	<div>
		{#each category.items as recipe, i (recipe._id)}
			<MenuRecipeItem {recipe} index={i} />
		{/each}
	</div>
</section>
