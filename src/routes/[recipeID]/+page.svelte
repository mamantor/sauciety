<script lang="ts">
	import styles from './page.module.scss';

	let { data } = $props();
</script>

<div class={styles.recipe__page}>
	<h1 class={styles.recipe__title}>{data.recipe.title}</h1>
	<div class={styles.recipe__legend}>{data.recipe.legend}</div>

	<div class={styles.recipe__top}>
		<div class={styles.image_container}>
			<img src={data.recipe.image} alt={data.recipe.title} class={styles.recipe__image} />
		</div>
		<div class={styles.ingredients}>
			<h2 class={styles.section__title}>Ingredients</h2>
			<div class={styles.ingredients__list}>
				<ul>
					{#each data.recipe.ingredients as ingredient}
						<li>{ingredient}</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<div class="section">
		<h2 class={styles.section__title}>Instructions</h2>
		<ol class={styles.instructions}>
			{#each data.recipe.instructions as step}
				<li class={styles.instructions__step}>{step}</li>
				<div class={styles.instructions__separator}></div>
			{/each}
		</ol>
	</div>
</div>

<style>
	
</style>
