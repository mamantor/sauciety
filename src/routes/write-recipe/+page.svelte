<script lang="ts">
	import { goto } from '$app/navigation';
	import { Image } from '@lucide/svelte';
	import styles from './page.module.scss';
	import Cropper from 'svelte-easy-crop';
	import { Trash } from 'svelte-heros';

	// --- State variables ---
	let title = '';
	let legend = '';
	let numberOfMeals = 0;
	let category = '';
	let ingredients = [''];
	let instructions = [''];
	let time = 0;
	let timeUnit = 'minutes';
	let notes = [''];
	let croppedIllustration = '';
	let base64RawImage = '';
	let isVegetarian = false;
	let isVegan = false;

	// Cropper state
	let cropArea = { x: 0, y: 0, width: 0, height: 0 };
	let crop = { x: 0, y: 0 };
	let zoom = 1;

	// --- Ingredient/Instruction/Note handlers ---
	function addIngredient() {
		ingredients = [...ingredients, ''];
	}
	function addInstruction() {
		instructions = [...instructions, ''];
	}
	function addNote() {
		notes = [...notes, ''];
	}
	function removeIngredient(index: number) {
		ingredients.splice(index, 1);
		ingredients = [...ingredients];
	}
	function removeInstruction(index: number) {
		instructions.splice(index, 1);
		instructions = [...instructions];
	}
	function removeNote(index: number) {
		notes.splice(index, 1);
		notes = [...notes];
	}

	// --- Image upload and crop ---
	function handleFileUpload(event: Event): void {
		const fileInput = event.target as HTMLInputElement;
		if (!fileInput.files || fileInput.files.length === 0) return;
		const file = fileInput.files[0];
		const reader = new FileReader();
		reader.onload = () => {
			base64RawImage = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function saveCroppedIllustration() {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = base64RawImage;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				if (!ctx) return reject('Canvas context not available');
				canvas.width = cropArea.width;
				canvas.height = cropArea.height;
				ctx.drawImage(
					img,
					cropArea.x,
					cropArea.y,
					cropArea.width,
					cropArea.height,
					0,
					0,
					cropArea.width,
					cropArea.height
				);
				croppedIllustration = canvas.toDataURL('image/png');
				resolve(croppedIllustration);
			};
			img.onerror = reject;
		});
	}

	// --- Submit handler ---
	async function submitRecipe() {
		if (!title.trim()) {
			alert('Title is required');
			return;
		}
		const cleanIngredients = ingredients.filter((i) => i.trim() !== '');
		const cleanInstructions = instructions.filter((i) => i.trim() !== '');
		const cleanNotes = notes.filter((i) => i.trim() !== '');
		if (cleanIngredients.length === 0 || cleanInstructions.length === 0) {
			alert('At least one ingredient and one instruction are required.');
			return;
		}
		const recipe = {
			title,
			ingredients: cleanIngredients,
			instructions: cleanInstructions,
			notes: cleanNotes,
			category,
			legend,
			image: croppedIllustration,
			numberOfMeals,
			vegetarian: isVegetarian,
			vegan: isVegan
		};
		const response = await fetch('/write-recipe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(recipe)
		});
		if (response.ok) {
			const result = await response.json();

			if (result.recipe.slug) {
				goto(`/` + result.recipe.slug);
			} else {
				alert('Recipe added successfully!');
			}
			return;
		} else {
			alert('Error adding recipe.');
		}
	}
</script>

<div class="shadow-soft container mt-12 rounded-xl bg-card py-6">
	<h2 class="flex justify-center font-serif text-2xl">Nouvelle Recette</h2>
	<div>
		<div class={styles.metadata}>
			<div class="flex flex-col gap-6">
				<div>
					<label class="mb-2 block" for="recipe-name">Nom de la recette : </label>
					<input class="input-base" id="recipe-name" type="text" bind:value={title} />
				</div>
				<div>
					<label class="mb-2 block" for="recipe-legend">Legende de la recette : </label>
					<textarea class="input-base" id="recipe-legend" bind:value={legend}></textarea>
				</div>

				<div>
					<label class="mb-2 block" for="recipe-category">Categorie </label>
					<select id="recipe-category" class="input-base" bind:value={category}>
						<option value="">Choisir une catégorie</option>
						<option value="Plat">🍽️ Plat</option>
						<option value="Dessert">🍰 Dessert</option>
						<option value="Apéro">🍹 Apéro</option>
						<option value="Soupe">🥣 Soupe</option>
						<option value="Salade">🥗 Salade</option>
					</select>
				</div>
				<div class="grid grid-cols-3 gap-8">
					<div class="items-center gap-4">
						<label class="mb-2 block" for="prep-time">Temps de préparation : </label>
						<div class="flex gap-4">
							<input id="prep-time" type="text" bind:value={time} class="input-base" />
							<select class="input-base" bind:value={timeUnit}>
								<option value="minutes">minutes</option>
								<option value="heures">heures</option>
								<option value="jours">jours</option>
							</select>
						</div>
					</div>
					<div>
						<div>
							<label class="mb-2 block" for="number-of-meals">Pour combien de personnes : </label>
							<input id="number-of-meals" bind:value={numberOfMeals} class="input-base" />
						</div>
					</div>
					<div>
						<div class={styles.veganToggles}>
							<div class="my-4 flex flex-col gap-4">
								<div class="flex items-center">
									<div class={styles.toggleLabel}>Végétarien</div>
									<div class="relative inline-block h-5 w-11">
										<input
											bind:checked={isVegetarian}
											id="switch-component-1"
											type="checkbox"
											class="peer h-5 w-11 cursor-pointer appearance-none rounded-full bg-slate-100 transition-colors duration-300 checked:bg-slate-800"
										/>
										<label
											for="switch-component-1"
											class="absolute right-12 h-0 w-0 cursor-pointer rounded-full border border-slate-300 bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800"
										>
											🥦
										</label>
									</div>
								</div>
								<div class="flex items-center">
									<div class={styles.toggleLabel}>Vegan</div>
									<div class="relative inline-block h-5 w-11">
										<input
											bind:checked={isVegan}
											id="switch-component-2"
											type="checkbox"
											class="peer h-5 w-11 cursor-pointer appearance-none bg-slate-100 transition-colors duration-300 checked:bg-slate-800"
										/>
										<label
											for="switch-component-2"
											class="absolute right-12 h-0 w-0 cursor-pointer bg-white transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800"
										>
											🥦
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-6">
				{#if base64RawImage}
					<div class="grid grid-cols-2 gap-8">
						<div class="flex flex-col gap-4">
							<div class="relative h-[300px] w-[300px] overflow-hidden rounded-lg">
								<Cropper
									image={base64RawImage}
									bind:crop
									bind:zoom
									aspect={21 / 9}
									oncropcomplete={(e) => {
										cropArea = e.pixels;
									}}
								/>
							</div>
						</div>
						<div class="flex flex-col justify-center gap-8">
							<button
								class="h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
								onclick={saveCroppedIllustration}>Selectionner la zone</button
							>
							<label
								for="file-upload"
								class="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
							>
								Changer d'illustration
							</label>
						</div>
					</div>
				{:else}
					<label
						for="file-upload"
						class="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
					>
					<Image class="mr-2 h-4 w-4" />
						Ajouter une illustration
					</label>
				{/if}

				<input
					id="file-upload"
					type="file"
					class="hidden"
					accept="image/*"
					onchange={handleFileUpload}
				/>
				{#if croppedIllustration}
					<div class="mt-4 overflow-hidden rounded-lg">
						<img src={croppedIllustration} alt="Illustration Découpée" />
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class={styles.section}>
		<h3 class="font-serif text-2xl">Ingredients</h3>
		<div class={styles.section__data}>
			{#each ingredients as ingredient, index}
				<div class={styles.input_group}>
					<input bind:value={ingredient} class="input-base" />
					<button class={styles.del_btn} onclick={() => removeIngredient(index)}>
						<Trash class="h-5 w-5" />
					</button>
				</div>
			{/each}
			<button class="button-base" onclick={addIngredient}>+ Ajouter un ingredient</button>
		</div>
	</div>
	<div class={styles.section}>
		<h3 class="font-serif text-2xl">Instructions</h3>
		<div class={styles.section__data}>
			{#each instructions as instruction, index}
				<div class={styles.input_group}>
					<textarea bind:value={instruction} class="input-base"></textarea>
					<button class={styles.del_btn} onclick={() => removeInstruction(index)}>
						<Trash class="h-5 w-5" />
					</button>
				</div>
			{/each}
			<button class="button-base" onclick={addInstruction}>+ Ajouter une étape</button>
		</div>
	</div>
	<div class={styles.section}>
		<h3 class="font-serif text-2xl">Notes</h3>
		<div class={styles.section__data}>
			{#each notes as note, index}
				<div class={styles.input_group}>
					<textarea bind:value={note} class="input-base"> </textarea>
					<button class={styles.del_btn} onclick={() => removeNote(index)}>
						<Trash class="h-5 w-5" />
					</button>
				</div>
			{/each}
			<button class="button-base" onclick={addNote}>Ajouter une Note</button>
		</div>
	</div>
	<br />
	<button class="button-base" onclick={submitRecipe}>Sauvegarder la recette</button>
</div>
