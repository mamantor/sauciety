<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, Clock, Pen, Trash2, Users } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	const session = $derived(data.session);

	let confirmingDelete = $state(false);

	function formatCommentDate(iso: string) {
		return new Date(iso).toLocaleString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<main class="container py-6 pb-20">
	<div class="animate-fade-in">
		<button
			onclick={() => goto(resolve('/'))}
			class="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			<span class="text-sm font-medium">Back to recipes</span>
		</button>

		<div class="shadow-soft rounded-xl bg-card">
			<div class="aspect-video overflow-hidden rounded-t-xl md:aspect-21/9">
				<img
					src={`/${data.recipe.slug}/image${data.recipe.updatedAt ? `?v=${new Date(data.recipe.updatedAt).getTime()}` : ''}`}
					alt={data.recipe.title}
					class="h-full w-full object-cover"
				/>
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
					{#if session?.user}
						<div class="flex gap-6">
							<button
								onclick={() => goto(resolve(`/write-recipe?id=${data.recipe._id}`))}
								class="shrink-0 text-muted-foreground hover:text-primary"
								aria-label="Modifier la recette"
							>
								<Pen class="h-4 w-4" />
							</button>
							<div class="relative">
								<button
									type="button"
									onclick={() => (confirmingDelete = true)}
									class="shrink-0 text-muted-foreground hover:text-destructive"
									aria-label="Supprimer la recette"
								>
									<Trash2 class="h-4 w-4" />
								</button>

								{#if confirmingDelete}
									<div
										class="shadow-soft absolute right-0 top-full z-10 mt-2 w-max max-w-[calc(100vw-2.5rem)] rounded-lg border border-border bg-card p-4 text-left sm:max-w-xs"
									>
										<p class="break-words text-sm text-foreground">
											Supprimer « {data.recipe.title} » ?
										</p>
										<p class="mt-1 text-xs text-muted-foreground">Cette action est irréversible.</p>
										<div class="mt-3 flex justify-end gap-2">
											<button
												type="button"
												onclick={() => (confirmingDelete = false)}
												class="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/30"
											>
												Annuler
											</button>
											<form method="POST" action="?/delete" use:enhance>
												<button
													type="submit"
													class="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
												>
													Supprimer
												</button>
											</form>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}
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
							{#each data.recipe.ingredients as ingredient, index (index)}
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
							{#each data.recipe.instructions as step, index (index)}
								<li class="flex gap-3 text-sm">
									<span class="shrink-0 font-serif font-medium text-primary">
										{index + 1}.
									</span>
									<span class="text-foreground">{step}</span>
								</li>
							{/each}
						</ol>
					</div>
				</div>

				<div class="mt-8">
					<h2 class="mb-4 font-serif text-xl text-foreground">Commentaires</h2>

					{#if data.comments.length > 0}
						<ul class="space-y-3">
							{#each data.comments as comment (comment._id)}
								<li class="rounded-lg border border-border bg-background p-4">
									<div class="flex items-baseline justify-between gap-2">
										<span class="text-sm font-medium text-foreground">{comment.author}</span>
										<span class="text-xs text-muted-foreground">
											{formatCommentDate(comment.createdAt)}
										</span>
									</div>
									<p class="mt-1 whitespace-pre-wrap text-sm text-foreground">{comment.text}</p>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
					{/if}

					{#if session?.user}
						<form method="POST" action="?/comment" use:enhance class="mt-4">
							<textarea
								name="text"
								required
								maxlength="2000"
								rows="3"
								placeholder="Ajouter un commentaire..."
								class="input-base resize-none"></textarea>
							{#if form?.message}
								<p class="mt-1 text-sm text-destructive">{form.message}</p>
							{/if}
							<button type="submit" class="button-base mt-2">Publier</button>
						</form>
					{:else}
						<p class="mt-4 text-sm text-muted-foreground">
							Connectez-vous pour laisser un commentaire.
						</p>
					{/if}
				</div>

				{#if data.recipe.notes?.length}
					<div class="mt-8">
						<h2 class="mb-4 font-serif text-xl text-foreground">Notes</h2>
						<ul class="space-y-2">
							{#each data.recipe.notes as note, index (index)}
								<li class="text-sm italic text-foreground">
									{note}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
</main>
