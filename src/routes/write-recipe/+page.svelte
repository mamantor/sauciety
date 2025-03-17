<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import styles from './page.module.scss';
	import Cropper from 'svelte-easy-crop';

	let title = '';
	let legend = '';
	let numberOfMeals = 0;
	let ingredients = [''];
	let instructions = [''];
	let category = ""
	let notes = [''];
	let croppedIllustration = '';
	let cropArea = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};

	let crop = { x: 0, y: 0 };
	let zoom = 1;
	let base64RawImage = '';

	function addIngredient() {
		ingredients = [...ingredients, ''];
	}

	function addInstruction() {
		instructions = [...instructions, ''];
	}

	function addNote() {
		notes = [...notes, ''];
	}

	/**
	 * @param {number} index
	 */
	function removeIngredient(index) {
		ingredients.splice(index, 1);
		ingredients = [...ingredients];
	}

	/**
	 * @param {number} index
	 */
	function removeInstruction(index) {
		instructions.splice(index, 1);
		instructions = [...instructions];
	}

	/**
	 * @param {number} index
	 */
	function removeNote(index) {
		notes.splice(index, 1);
		notes = [...notes];
	}

	function handleFileUpload(event) {
		const fileInput = event.target;
		if (!fileInput.files || fileInput.files.length === 0) return;

		const file = fileInput.files[0];
		const reader = new FileReader();

		reader.onload = () => {
			base64RawImage = reader.result;
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

				// Set the canvas size to match the cropped area
				canvas.width = cropArea.width;
				canvas.height = cropArea.height;

				// Draw the cropped portion of the image onto the canvas
				ctx.drawImage(
					img,
					cropArea.x,
					cropArea.y,
					cropArea.width,
					cropArea.height, // Source image coordinates and size
					0,
					0,
					cropArea.width,
					cropArea.height // Destination on canvas
				);

				// Convert the canvas content to a Base64 string
				const croppedBase64 = canvas.toDataURL('image/png');

				croppedIllustration = croppedBase64;
				resolve(croppedBase64);
			};

			img.onerror = reject;
		});
	}

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
			category
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
	<h2 class={styles.title}>Ecrire une nouvelle recette</h2>
	<div class={styles.section}>
		<div class={styles.metadata}>
			<div class={styles.metadata__text}>
				<div>
					<label class={styles.section__title}>Nom de la recette : </label>
					<input type="text" bind:value={title} />
				</div>
				<div>
					<label class={styles.section__title}>Legende de la recette : </label>
					<textarea bind:value={legend} />
				</div>
				<div>
					<label class={styles.section__title}>Pour combien de repas : </label>

					<input type="number" bind:value={numberOfMeals} />
				</div>
				<div>
					<label class={styles.section__title}>Categorie </label>

					<input type="number" bind:value={category} />
				</div>
			</div>
			<div class={styles.metadata__image}>
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
				<input type="file" accept="image/*" onchange={handleFileUpload} />

				{#if croppedIllustration}
					<div class={styles.illustration__preview}></div>
					<img src={croppedIllustration} alt="Illustration Découpée" />
				{/if}
			</div>
		</div>
	</div>
	<div class={styles.section}>
		<h3 class={styles.section__title}>Ingredients</h3>
		<div class={styles.section__data}>
			{#each ingredients as ingredient, index}
				<div class={styles.input_group}>
					<input type="text" bind:value={ingredient} />
					<button class={styles.del_btn} onclick={() => removeIngredient(index)}>x</button>
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
					<button class={styles.del_btn} onclick={() => removeInstruction(index)}>x</button>
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
					<button class={styles.del_btn} onclick={() => removeNote(index)}>x</button>
				</div>
			{/each}
			<button class={styles.add_btn} onclick={addNote}>+ Ajouter une étape</button>
		</div>
	</div>

	<br />

	<button class={styles.save_btn} onclick={submitRecipe}>Sauvegarder la recette</button>
</div>
