import { json } from "@sveltejs/kit";
import { getMongoDatabase } from "$lib/server/mongo/client";
import { ObjectId } from "mongodb";

export type SanitizedRecipe = {
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
};

export async function POST({ request }) {
  const db = await getMongoDatabase('sauciety')

  const collection = db.collection("recipes");

  try {
    const data = await request.json();
    if (!data.title || !data.ingredients.length || !data.instructions.length) {
      return json({ error: "Invalid data" }, { status: 400 });
    }

    // Whitelist of allowed fields
    const allowedFields = ["category", "title", "ingredients", "instructions", "legend", "image", "tags", "author", "servings", "cooktime", "timeUnit", "vegetarian", "vegan", "notes"] as const;
    const sanitizedData: Partial<SanitizedRecipe> = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        sanitizedData[field] = data[field];
      }
    }

    // Generate slug from title
    sanitizedData.slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (data.editId) {
      await collection.updateOne({ _id: new ObjectId(data.editId) }, { $set: sanitizedData });
      return json({ message: "Recipe updated successfully", recipe: sanitizedData }, { status: 200 });
    } else {

      await collection.insertOne(sanitizedData as SanitizedRecipe);
    }
    return json({ message: "Recipe added successfully", recipe: sanitizedData }, { status: 201 });
  } catch (error) {
    return json({ error }, { status: 500 });
  }
}
