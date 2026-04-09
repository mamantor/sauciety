import { getMongoDatabase } from "$lib/server/mongo/client"
import { error, redirect } from '@sveltejs/kit';
import { ObjectId } from "mongodb";


export const actions = {
	delete: async ({ params }) => {

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

export async function load({ params }) {

	const db = await getMongoDatabase('sauciety')
	const recipesCollection = db.collection('recipes');
	const recipeSlug = params.recipeID;
	const recipe = await recipesCollection.findOne({ slug: recipeSlug });


	if (!recipe) {
		redirect(302, '/')
	}

	return {
		recipe: { ...recipe, _id: recipe._id.toString() },
		recipeSlug
	}
};