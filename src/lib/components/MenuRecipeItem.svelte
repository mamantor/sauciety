<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Clock, Leaf, Sprout, Users } from '@lucide/svelte';

	let { recipe, index } = $props();
</script>

<article
	class="group -mx-4 animate-fade-in cursor-pointer border-b border-border/50 px-4 py-4 transition-colors last:border-b-0 hover:bg-accent/30"
	style={`animation-delay: ${index * 50}ms`}
>
	<div
		class="flex items-start justify-between gap-4"
		onclick={() => goto(resolve(`/${recipe.slug}`))}
		role="link"
		tabindex="0"
		onkeypress={(e) => {
			if (e.key === 'Enter') goto(resolve(`/${recipe.slug}`));
		}}
	>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<h3 class="font-serif text-lg text-foreground transition-colors group-hover:text-primary">
					{recipe.title}
				</h3>
				{#if recipe.vegan}
					<span
						class="inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold"
						title="Vegan"
					>
						<Sprout class="h-3 w-3" />
						VG
					</span>
				{:else if recipe.vegetarian && !recipe.vegan}
					<span
						class="inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold"
						title="Vegetarian"
					>
						<Leaf class="h-3 w-3" />
						V
					</span>
				{/if}
			</div>
			<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
				{recipe.legend}
			</p>
			<p class="mt-1 text-xs italic text-muted-foreground/70">
				par {recipe.author}
			</p>
		</div>
		<div class="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
			<span class="flex items-center gap-1">
				<Clock class="h-3 w-3" />
				{recipe.cookTime} min
			</span>
			<span class="flex items-center gap-1">
				<Users class="h-3 w-3" />
				{recipe.servings}
			</span>
		</div>
	</div>
</article>
