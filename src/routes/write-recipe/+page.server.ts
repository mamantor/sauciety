import { getMongoDatabase } from '$lib/server/mongo/client';
import { requireSession } from '$lib/server/auth';
import { ObjectId } from 'mongodb';
import type { PageServerLoad } from './$types';
import type { Recipe, RecipeClient } from '$lib/types/recipe';

export const load: PageServerLoad = async (event) => {
	await requireSession(event);

	const id = event.url.searchParams.get('id');

	if (id && ObjectId.isValid(id)) {
		const db = await getMongoDatabase();
		const recipesCollection = db.collection<Recipe>('recipes');
		const recipe = await recipesCollection.findOne(
			{ _id: new ObjectId(id) },
			{
				projection: {
					image: 0
				}
			}
		);

		if (recipe) {
			const editRecipe: RecipeClient = {
				...recipe,
				_id: recipe._id.toString()
			};

			return { editRecipe };
		}
	}

	return {
		editRecipe: null
	};
};
