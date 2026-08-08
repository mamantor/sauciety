import { getMongoDatabase } from "$lib/server/mongo/client";

export async function GET({ params }) {
    const db = await getMongoDatabase('sauciety')

    const recipesCollection = db.collection("recipes");
    const recipe = await recipesCollection.findOne(
        { slug: params.recipeID },
        { projection: { image: 1 } }
    );

    if (!recipe?.image?.data) {
        return new Response('Not found', { status: 404 });
    }

    return new Response(recipe.image.data.buffer, {
        headers: {
            'Content-Type': recipe.image.contentType,
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    });
}