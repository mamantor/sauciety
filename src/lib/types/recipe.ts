import type { ObjectId, Binary } from 'mongodb';

export type Recipe = {
	_id: ObjectId;
	title: string;
	ingredients: string[];
	instructions: string[];
	image?: {
		data: Binary;
		contentType: string;
		filename: string;
		size: number;
	};
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
	updatedAt?: Date;
};

// image is never sent to the client: server routes always project it out
// and serve it separately via /<slug>/image instead.
export type RecipeClient = Omit<Recipe, '_id' | 'image'> & {
	_id: string;
};

// The subset of fields the homepage's $group aggregation actually selects.
export type RecipeSummary = Pick<
	RecipeClient,
	'author' | 'vegan' | 'vegetarian' | 'title' | 'slug' | 'legend' | 'cooktime' | 'servings' | '_id'
>;

export type RecipeCategory = {
	_id: string;
	items: RecipeSummary[];
};

export type Comment = {
	_id: ObjectId;
	recipeSlug: string;
	author: string;
	text: string;
	createdAt: Date;
};

export type CommentClient = Omit<Comment, '_id' | 'createdAt'> & {
	_id: string;
	createdAt: string;
};
