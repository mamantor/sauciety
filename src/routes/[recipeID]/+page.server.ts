import { getMongoDatabase } from "$lib/server/mongo/client"
import { error, redirect } from '@sveltejs/kit';
import { ObjectId } from "mongodb";
import type { PageServerLoad } from './$types';
import type { Recipe, RecipeClient } from '$lib/types/recipe';


export const actions = {
	delete: async (event) => {

		const session = await event.locals.auth();

		if (!session?.user) {
			throw redirect(303, '/');
		}


		const { params } = event;
		const id = params.recipeID;
		console.log('delete', id)
		if (!id) {
			throw error(400, 'Invalid recipe ID');
		}

		const db = await getMongoDatabase('sauciety');
		const collection = db.collection('recipes');

		await collection.deleteOne({ slug: id });

		throw redirect(303, '/'); // or wherever
	}
};

export const load: PageServerLoad = async (event) => {

	const { params } = event;

	const db = await getMongoDatabase('sauciety')
	const recipesCollection = db.collection<Recipe>('recipes');
	const recipeSlug = params.recipeID;
	const recipe = await recipesCollection.findOne({ slug: recipeSlug });


	if (!recipe) {
		throw error(404, 'Recipe not found');
	}

	const clientRecipe: RecipeClient = {
		...recipe,
		_id: recipe._id.toString()
	};

	return {
		recipe: clientRecipe,
		recipeSlug
	}
};