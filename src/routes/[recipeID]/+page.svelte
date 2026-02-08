<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, Clock, Trash2, Users } from '@lucide/svelte';
	import styles from './page.module.scss';

	let { data } = $props();
</script>

<main class="container py-6 pb-20">
	<div class="animate-fade-in">
		<button
			onclick={() => goto('/')}
			class="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			<span class="text-sm font-medium">Back to recipes</span>
		</button>

		<div class="shadow-soft overflow-hidden rounded-xl bg-card">
			<div class="aspect-video overflow-hidden md:aspect-[21/9]">
				<img src={data.recipe.image} alt={data.recipe.title} class="h-full w-full object-cover" />
			</div>

			<div class="p-5 md:p-8">
				<div class="flex items-start justify-between gap-4">
					<div>
						<span class="text-xs font-medium uppercase tracking-wider text-primary">
							{data.recipe.category}
						</span>
						<h1 class="mt-1 font-serif text-2xl text-foreground md:text-3xl">
							{data.recipe.title}
						</h1>
					</div>
					<div class="shrink-0 text-muted-foreground hover:text-destructive">
						<Trash2 class="h-4 w-4" />
					</div>
				</div>

				<p class="mt-2 text-muted-foreground">{data.recipe.legend}</p>

				<div class="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
					<span class="flex items-center gap-2">
						<Clock class="h-4 w-4 text-primary" />
						{data.recipe.cooktime} min
					</span>
					<span class="flex items-center gap-2">
						<Users class="h-4 w-4 text-primary" />
						{data.recipe.servings} servings
					</span>
				</div>

				<div class="mt-8 grid gap-8 md:grid-cols-2">
					<div>
						<h2 class="mb-4 font-serif text-xl text-foreground">Ingredients</h2>
						<ul class="space-y-2">
							{#each data.recipe.ingredients as ingredient, i}
								<li class="flex items-start gap-3 text-sm text-foreground">
									<span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"> </span>
									{ingredient}
								</li>
							{/each}
						</ul>
					</div>

					<div>
						<h2 class="mb-4 font-serif text-xl text-foreground">Instructions</h2>
						<ol class="space-y-4">
							{#each data.recipe.instructions as step, i}
								<li class="flex gap-3 text-sm">
									<span class="shrink-0 font-serif font-medium text-primary">
										{i + 1}.
									</span>
									<span class="text-foreground">{step}</span>
								</li>
							{/each}
						</ol>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
