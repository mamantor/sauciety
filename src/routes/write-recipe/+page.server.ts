import { getMongoDatabase } from "$lib/server/mongo/client"
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import type { PageServerLoad } from './$types';

type recipeFromDB = {
    _id: ObjectId;
    title: string;
    ingredients: string[];
    instructions: string[];
    description?: string;
    tags?: string[];
    slug: string;
    legend?: string;
    author?: string;
    servings?: number;
    cooktime?: number;
    timeUnit?: string;
    vegetarian?: boolean;
    vegan?: boolean;
    notes?: string[];
    category?: string;
};

export type EditableRecipe = Omit<recipeFromDB, '_id'> & {
    _id: string;
};

export const load : PageServerLoad = (async (event) => {
    const session = await event.locals.auth();

    if (!session?.user) {
        throw redirect(303, '/');
    }

    const id = event.url.searchParams.get('id');

    if (id && ObjectId.isValid(id)) {
        const db = await getMongoDatabase('sauciety')
        const recipesCollection = db.collection<recipeFromDB>('recipes');
        const recipe = await recipesCollection.findOne({ _id: new ObjectId(id) }, {
            projection: {
                image: 0
            }
        });

        if (recipe) {
            const editRecipe: EditableRecipe = {
                ...recipe,
                _id: recipe._id.toString()
            };

            return { editRecipe };
        }
    }

    return {
        editRecipe: null
    }


})