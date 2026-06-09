
import type { ObjectId } from 'mongodb';

export type Recipe = {
    _id: ObjectId;
    title: string;
    ingredients: string[];
    instructions: string[];
    description?: string;
    image?: string;
    tags?: string[];
    slug: string;
    legend?: string;
    author?: string;
    servings?: number;
    cooktime?: number;
    timeUnit?: string;
    vegetarian?: boolean;
    vegan?: boolean;
    notes?: string;
    category?: string;
}

export type RecipeClient = Omit<Recipe, '_id'> & {
	_id: string;
};