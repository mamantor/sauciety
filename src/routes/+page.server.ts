import { getMongoDatabase } from '$lib/server/mongo/client';
import type { RecipeCategory } from '$lib/types/recipe';

export async function load() {
	const db = await getMongoDatabase();

	const collection = db.collection('recipes');
	const recipes = await collection
		.aggregate<RecipeCategory>([
			{
				$group: {
					_id: '$category', // Grouping by category
					items: {
						$push: {
							author: '$author',
							vegan: '$vegan',
							vegetarian: '$vegetarian',
							title: '$title',
							slug: '$slug',
							legend: '$legend',
							cooktime: '$cooktime',
							servings: '$servings',
							_id: { $toString: '$_id' }
						} // Collecting title and slug for each document
					}
				}
			}
		])
		.toArray();
	const tocOrder = ['Plat', 'Dessert'];

	recipes.sort((a, b) => {
		// Get the index of each category in the custom order.
		// If a category is not found, assign a high index to sort it at the end.
		const indexA = tocOrder.indexOf(a._id) !== -1 ? tocOrder.indexOf(a._id) : Number.MAX_VALUE;
		const indexB = tocOrder.indexOf(b._id) !== -1 ? tocOrder.indexOf(b._id) : Number.MAX_VALUE;
		return indexA - indexB;
	});
	return {
		recipes
	};
}
