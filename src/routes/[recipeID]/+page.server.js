// Import the MongoDB client and ObjectId helper
import { MongoClient } from 'mongodb';
import { redirect } from '@sveltejs/kit';

// You can store your connection URI and database name in environment variables for security.
const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'sauciety';

export async function load({ params }) {

	const client = new MongoClient(MONGODB_URI);
	await client.connect();
	const db = client.db(DB_NAME);
	const recipesCollection = db.collection('recipes');
	const recipeSlug = params.recipeID;
	const recipe = await recipesCollection.findOne({ slug: recipeSlug }, { projection: { _id: 0 } });


	if (!recipe) {
		redirect(302, '/')
	}

	return {
		recipe,
		recipeSlug		
	}
};