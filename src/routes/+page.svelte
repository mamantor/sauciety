<script>
	import styles from './page.module.scss';

	let { data } = $props();

	console.log(data);
</script>

<div>
	<div class={styles.bookTitle}>{data.general.bookName}</div>
	<div class={styles.toc__label}>Sommaire</div>
	<div class={styles.toc__content}>
		{#each data.recipes as category}
			<div class={styles.category}>
				<div class={styles.category__label}>
						<img width="20px" style="margin-right:0.5rem" src={`/icons/${category._id}.svg`} />
					{category._id}
						<img width="20px" style="margin-left:0.5rem" src={`/icons/${category._id}.svg`} />
				</div>
				{#each category.items as recipe}
					<div class={styles.recipe__title}>
						<a href={recipe.slug}>
							<span>{recipe.title}</span>
							<span class={styles.dotted_line}></span>
							<span>{recipe.time}</span>
							{#if recipe.vegetarian}<span>V</span>{/if}
						</a>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
