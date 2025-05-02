<script lang="ts">
	import { goto } from '$app/navigation';
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
	let vegetarian = false;
	let vegan = false;
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
			alert('Recipe added successfully!');
			// goto('/');
		} else {
			alert('Error adding recipe.');
		}
	}
</script>

<div class={styles.form_container}>
	<h2 class={styles.title}>Nouvelle Recette</h2>
	<div class={styles.section}>
		<div class={styles.metadata}>
			<div class={styles.metadata__text}>
				<div class={styles.metadata__field}>
					<label>Nom de la recette : </label>
					<input type="text" bind:value={title} />
				</div>
				<div class={styles.metadata__field}>
					<label>Legende de la recette : </label>
					<textarea bind:value={legend} />
				</div>

				<div class={styles.metadata__field}>
					<label>Categorie </label>
					<select bind:value={category}>
						<option value="">Choisir une catégorie</option>
						<option value="Plat">🍽️ Plat</option>
						<option value="Dessert">🍰 Dessert</option>
						<option value="Apéro">🍹 Apéro</option>
						<option value="Soupe">🥣 Soupe</option>
						<option value="Salade">🥗 Salade</option>
					</select>
				</div>
				<div class={styles.metadata__field}>
					<div class={styles.fieldGroup}>
						<label class="whitespace-nowrap">Temps de préparation : </label>
						<input type="text" bind:value={time} class="min-w-0" />
						<select class="w-auto" bind:value={timeUnit}>
							<option value="minutes">minutes</option>
							<option value="heures">heures</option>
							<option value="jours">jours</option>
						</select>
					</div>
					<div class={styles.fieldGroup}>
						<div>
							<label>Pour combien de personnes : </label>
							<input bind:value={numberOfMeals} class="max-w-10"/>
						</div>
						<div class={styles.veganToggles}>
							<div class="my-4 flex items-center gap-6">
								<div class="flex items-center">
									<div class={styles.toggleLabel}>Végétarien</div>
									<div class="relative inline-block h-5 w-11">
										<input
											checked
											id="switch-component-1"
											type="checkbox"
											class="peer h-5 w-11 cursor-pointer appearance-none rounded-full bg-slate-100 transition-colors duration-300 checked:bg-slate-800"
										/>
										<label
											for="switch-component-1"
											class="absolute right-12 h-0 w-0 cursor-pointer rounded-full border border-slate-300 bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800"
											>🥦
										</label>
									</div>
								</div>
								<div class="flex items-center">
									<div class={styles.toggleLabel}>Vegan</div>
									<div class="relative inline-block h-5 w-11">
										<input
											checked
											id="switch-component-2"
											type="checkbox"
											class="peer h-5 w-11 cursor-pointer appearance-none rounded-full bg-slate-100 transition-colors duration-300 checked:bg-slate-800"
										/>
										<label
											for="switch-component-2"
											class="absolute right-12 h-0 w-0 cursor-pointer rounded-full border border-slate-300 bg-white transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800"
											>🥦
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class={styles.metadata__image}>
				{#if base64RawImage}
					<div class={styles.cropper__container}>
						<Cropper
							image={base64RawImage}
							bind:crop
							bind:zoom
							aspect={1}
							oncropcomplete={(e) => {
								cropArea = e.pixels;
							}}
						/>
					</div>
					<button onclick={saveCroppedIllustration}>Sauvegarder cette illustration</button>
				{/if}
				<input type="file" accept="image/*" onchange={handleFileUpload} />
				{#if croppedIllustration}
					<div class={styles.illustration__preview}>
						<img src={croppedIllustration} alt="Illustration Découpée" />
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class={styles.section}>
		<h3 class={styles.section__title}>Ingredients</h3>
		<div class={styles.section__data}>
			{#each ingredients as ingredient, index}
				<div class={styles.input_group}>
					<input bind:value={ingredient} />
					<button class={styles.del_btn} onclick={() => removeIngredient(index)}><Trash class="w-5 h-5" /></button>
				</div>
			{/each}
			<button class={styles.add_btn} onclick={addIngredient}>+ Ajouter un ingredient</button>
		</div>
	</div>
	<div class={styles.section}>
		<h3 class={styles.section__title}>Instructions</h3>
		<div class={styles.section__data}>
			{#each instructions as instruction, index}
				<div class={styles.input_group}>
					<textarea bind:value={instruction}></textarea>
					<button class={styles.del_btn} onclick={() => removeInstruction(index)}><Trash class="w-5 h-5" /></button>
				</div>
			{/each}
			<button class={styles.add_btn} onclick={addInstruction}>+ Ajouter une étape</button>
		</div>
	</div>
	<div class={styles.section}>
		<h3 class={styles.section__title}>Notes</h3>
		<div class={styles.section__data}>
			{#each notes as note, index}
				<div class={styles.input_group}>
					<textarea bind:value={note}></textarea>
					<button class={styles.del_btn} onclick={() => removeNote(index)}><Trash class="w-5 h-5" /></button>
				</div>
			{/each}
			<button class={styles.add_btn} onclick={addNote}>+ Ajouter une étape</button>
		</div>
	</div>
	<br />
	<button class={styles.save_btn} onclick={submitRecipe}>Sauvegarder la recette</button>
</div>
