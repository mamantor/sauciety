import { getMongoDatabase } from "$lib/server/mongo/client"
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    const session = await event.locals.auth();

    if (!session?.user) {
        throw redirect(303, '/');
    }

    const id = event.url.searchParams.get('id');

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
        editRecipe: null
    }


};