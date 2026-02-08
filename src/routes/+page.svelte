<script>
	import MenuSection from '$lib/components/MenuSection.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import styles from './page.module.scss';
	import { UtensilsCrossed } from '@lucide/svelte';

	let { data } = $props();
	let search = $state('');

	let filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		if (!q) return data.recipes;

		return data.recipes
			.map((category) => {
				const items = category.items.filter((recipe) => recipe.title.toLowerCase().includes(q));
				return { ...category, items };
			})
			.filter((category) => category.items.length > 0);
	});

</script>

<main class="container py-6 pb-20">
	<div class="mb-8">
		<SearchBar bind:value={search} />
		{search}
	</div>
	<div class="mx-auto max-w-2xl rounded-lg bg-card p-6 shadow-card md:p-8">
		<div class="mb-8 text-center">
			<div class="inline-block">
				<div class="mb-2 flex items-center justify-between">
					<div class="h-px w-12 bg-primary/50" />
					<UtensilsCrossed class="h-5 w-5 text-primary" />
					<div class="h-px w-12 bg-primary/50" />
				</div>
				<h1 class="font-serif text-2xl text-foreground md:text-3xl">Our Recipes</h1>
			</div>
		</div>
		{#each filtered as category (category._id)}
			<MenuSection category={category} />
		{/each}
	</div>
</main>
