<script lang="ts">
	import { goto } from '$app/navigation';
	import { Image as ImageIcon } from '@lucide/svelte';
	import styles from './page.module.scss';
	import Cropper from 'svelte-easy-crop';
	import { Trash } from 'svelte-heros';
	import type { EditableRecipe } from './+page.server';
	import { resolve } from '$app/paths';

	export let data;

	const { editRecipe } = data;

	type formType = {
		author: string;
		category: string;
		cooktime: number;
		image: string;
		ingredients: string[];
		instructions: string[];
		vegan: boolean;
		vegetarian: boolean;
		legend: string;
		notes: string[];
		servings: number;
		timeUnit: string;
		title: string;
	};

	let defaultValues = {
		category: '',
		cooktime: 0,
		image: '',
		ingredients: [''],
		instructions: [''],
		vegan: false,
		vegetarian: false,
		legend: '',
		notes: [''],
		servings: 0,
		timeUnit: 'minutes',
		title: '',
		author: ''
	};

	let base64RawImage: string = '';

	const withDefaults = (r: EditableRecipe | null) => ({
		...defaultValues,
		...(r ?? {}),
		// ensure array fields are never empty / undefined
		ingredients: r?.ingredients?.length ? r.ingredients : [''],
		instructions: r?.instructions?.length ? r.instructions : [''],
		notes: r?.notes?.length ? r.notes : ['']
	});

	let form: formType = withDefaults(editRecipe);

	let croppedImageBlob: Blob | null = null;

	// Cropper state
	let cropArea = { x: 0, y: 0, width: 0, height: 0 };
	let crop = { x: 0, y: 0 };
	let zoom = 1;

	// --- Ingredient/Instruction/Note handlers ---
	function addIngredient() {
		form.ingredients = [...form.ingredients, ''];
	}
	function addInstruction() {
		form.instructions = [...form.instructions, ''];
	}
	function addNote() {
		form.notes = [...form.notes, ''];
	}
	function removeIngredient(index: number) {
		form.ingredients.splice(index, 1);
		form.ingredients = [...form.ingredients];
	}
	function removeInstruction(index: number) {
		form.instructions.splice(index, 1);
		form.instructions = [...form.instructions];
	}
	function removeNote(index: number) {
		form.notes.splice(index, 1);
		form.notes = [...form.notes];
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

	async function saveimage() {
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
				canvas.toBlob(
					(blob) => {
						if (!blob) return reject('Could not create image blob');

						croppedImageBlob = blob;
						form.image = URL.createObjectURL(blob);
						resolve(blob);
					},
					'image/jpeg',
					0.82
				);
			};
			img.onerror = reject;
		});
	}

	// --- Submit handler ---
	async function submitRecipe() {
		if (!form.title.trim()) {
			alert('Title is required');
			return;
		}
		const cleanIngredients = form.ingredients.filter((i) => i.trim() !== '');
		const cleanInstructions = form.instructions.filter((i) => i.trim() !== '');
		const cleanNotes = form.notes.filter((i) => i.trim() !== '');
		if (cleanIngredients.length === 0 || cleanInstructions.length === 0) {
			alert('At least one ingredient and one instruction are required.');
			return;
		}

		const formData = new FormData();

		formData.append('author', form.author);
		formData.append('category', form.category);
		formData.append('cooktime', form.cooktime.toString());
		if (croppedImageBlob) {
			formData.append('image', croppedImageBlob, 'recipe-image.jpg');
		}
		formData.append('legend', form.legend);
		formData.append('servings', form.servings.toString());
		formData.append('timeUnit', form.timeUnit);
		formData.append('title', form.title);
		formData.append('vegan', form.vegan.toString());
		formData.append('vegetarian', form.vegetarian.toString());
		formData.append('editId', editRecipe?._id ?? '');
		formData.append(`ingredients`, JSON.stringify(cleanIngredients));
		formData.append(`instructions`, JSON.stringify(cleanInstructions));
		formData.append(`notes`, JSON.stringify(cleanNotes));

		const response = await fetch('/write-recipe', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			const result = await response.json();

			if (result.recipe.slug) {
				goto(resolve(`/${result.recipe.slug}`));
			} else {
				alert('Recipe added successfully!');
			}
			return;
		} else {
			const result = await response.json().catch(() => null);
			alert(result?.error ?? 'Error adding recipe.');
		}
	}
</script>

<div class="shadow-soft container mt-6 max-w-[1200px] rounded-xl bg-card p-4 sm:mt-12 sm:p-12">
	<h2 class="flex justify-center font-serif text-2xl">Nouvelle Recette</h2>
	<div>
		<div class={styles.metadata}>
			<div class="flex flex-col gap-6">
				<div>
					<label class="mb-2 block" for="recipe-name">Nom de la recette : </label>
					<input class="input-base" id="recipe-name" type="text" bind:value={form.title} />
				</div>
				<div>
					<label class="mb-2 block" for="recipe-legend">Legende de la recette : </label>
					<textarea class="input-base" id="recipe-legend" bind:value={form.legend}></textarea>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
					<div>
						<label class="mb-2 block" for="recipe-category">Categorie </label>
						<select id="recipe-category" class="input-base" bind:value={form.category}>
							<option value="">Choisir une catégorie</option>
							<option value="Plat">🍽️ Plat</option>
							<option value="Dessert">🍰 Dessert</option>
							<option value="Apéro">🍷 Apéro</option>
							<option value="Soupe">🥣 Soupe</option>
							<option value="Salade">🥗 Salade</option>
							<option value="Cocktail">🍹 Cocktail</option>
						</select>
					</div>
					<div>
						<label class="mb-2 block" for="recipe-author">Auteur : </label>
						<input class="input-base" id="recipe-author" type="text" bind:value={form.author} />
					</div>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
					<div class="items-center gap-4">
						<label class="mb-2 block" for="prep-time">Temps de préparation : </label>
						<div class="flex gap-4">
							<input id="prep-time" type="text" bind:value={form.cooktime} class="input-base" />
							<select class="input-base" bind:value={form.timeUnit}>
								<option value="minutes">minutes</option>
								<option value="heures">heures</option>
								<option value="jours">jours</option>
							</select>
						</div>
					</div>
					<div>
						<div>
							<label class="mb-2 block" for="number-of-meals">Pour combien de personnes : </label>
							<input id="number-of-meals" bind:value={form.servings} class="input-base" />
						</div>
					</div>
					<div>
						<div class={styles.veganToggles}>
							<div class="my-4 flex flex-row justify-center gap-6 sm:flex-col sm:justify-start sm:gap-4">
								<div class="flex items-center">
									<div class={styles.toggleLabel}>Végétarien</div>
									<div class="relative inline-block h-5 w-11">
										<input
											bind:checked={form.vegetarian}
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
											bind:checked={form.vegan}
											id="switch-component-2"
											type="checkbox"
											class="peer h-5 w-11 cursor-pointer appearance-none rounded-full bg-slate-100 transition-colors duration-300 checked:bg-slate-800"
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
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
						<div class="flex flex-col gap-4">
							<div
								class="relative h-[220px] w-full overflow-hidden rounded-lg sm:h-[300px] sm:w-[300px]"
							>
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
						<div class="flex flex-col justify-center gap-4 sm:gap-8">
							<button
								class="h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
								onclick={saveimage}>Selectionner la zone</button
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
						<ImageIcon class="mr-2 h-4 w-4" />
						{#if form.image}
							Changer d'illustration
						{:else}
							Ajouter une illustration
						{/if}
					</label>
				{/if}

				<input
					id="file-upload"
					type="file"
					class="hidden"
					accept="image/*"
					onchange={handleFileUpload}
				/>
				{#if form.image}
					<div class="mt-4 overflow-hidden rounded-lg">
						<img src={form.image} alt="Illustration Découpée" />
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class={styles.section}>
		<h3 class="font-serif text-2xl">Ingredients</h3>
		<div class={styles.section__data}>
			{#each form.ingredients as ingredient, index (index)}
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
			{#each form.instructions as instruction, index (index)}
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
			{#each form.notes as note, index (index)}
				<div class={styles.input_group}>
					<textarea bind:value={note} class="input-base"></textarea>
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
