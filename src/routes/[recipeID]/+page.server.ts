import { getMongoDatabase } from '$lib/server/mongo/client';
import { requireSession } from '$lib/server/auth';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Comment, CommentClient, Recipe, RecipeClient } from '$lib/types/recipe';

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
	},

	comment: async (event) => {
		const session = await requireSession(event);

		const { params, request } = event;
		const recipeSlug = params.recipeID;
		if (!recipeSlug) {
			throw error(400, 'Invalid recipe ID');
		}

		const formData = await request.formData();
		const text = String(formData.get('text') ?? '').trim();

		if (!text) {
			return fail(400, { message: 'Le commentaire ne peut pas être vide.' });
		}
		if (text.length > 2000) {
			return fail(400, { message: 'Le commentaire est trop long.' });
		}

		const db = await getMongoDatabase();
		await db.collection<Omit<Comment, '_id'>>('comments').insertOne({
			recipeSlug,
			author: session.user?.name ?? 'Anonyme',
			text,
			createdAt: new Date()
		});
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

	const comments = await db
		.collection<Comment>('comments')
		.find({ recipeSlug })
		.sort({ createdAt: 1 })
		.toArray();

	const clientComments: CommentClient[] = comments.map((comment) => ({
		...comment,
		_id: comment._id.toString(),
		createdAt: comment.createdAt.toISOString()
	}));

	return {
		recipe: clientRecipe,
		recipeSlug,
		comments: clientComments
	};
};
