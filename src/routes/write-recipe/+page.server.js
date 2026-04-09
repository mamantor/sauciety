import { getMongoDatabase } from "$lib/server/mongo/client"
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export async function load({ url }) {

    const id = url.searchParams.get('id');

    if (id) {
        const db = await getMongoDatabase('sauciety')
        const recipesCollection = db.collection('recipes');
        const recipe = await recipesCollection.findOne({ _id: new ObjectId(id) });
        if (recipe) {

            return {
                editRecipe: { ...recipe, _id: recipe._id.toString() },
            }
        }
    }

    return {
        editRecipe : null
    }


};