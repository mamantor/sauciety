import { getMongoDatabase } from '$lib/server/mongo/client';
import { requireSession } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Recipe, RecipeClient } from '$lib/types/recipe';

export const actions = {
	delete: async (event) => {
		await requireSession(event);

		const { params } = event;
		const id = params.recipeID;
		if (!id) {
			throw error(400, 'Invalid recipe ID');
		}

		const db = await getMongoDatabase();
		const collection = db.collection('recipes');

		await collection.deleteOne({ slug: id });

		throw redirect(303, '/'); // or wherever
	}
};

export const load: PageServerLoad = async (event) => {
	const { params } = event;

	const db = await getMongoDatabase();
	const recipesCollection = db.collection<Recipe>('recipes');
	const recipeSlug = params.recipeID;
	const recipe = await recipesCollection.findOne(
		{ slug: recipeSlug },
		{
			projection: {
				image: 0
			}
		}
	);

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
	};
};
