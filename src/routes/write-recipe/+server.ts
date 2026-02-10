import { json } from "@sveltejs/kit";
import { getMongoDatabase } from "$lib/mongo/client";

export type SanitizedRecipe = {
  title: string;
  ingredients: string[];
  instructions: string[];
  description?: string;
  image?: string;
  tags?: string[];
  slug: string;
};

const db = await getMongoDatabase('sauciety')

const collection = db.collection("recipes");

export async function POST({ request }) {
  try {
    const data = await request.json();
    if (!data.title || !data.ingredients.length || !data.instructions.length) {
      return json({ error: "Invalid data" }, { status: 400 });
    }

    // Whitelist of allowed fields
    const allowedFields = ["title", "ingredients", "instructions", "legend", "image", "tags"];
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

    console.log(sanitizedData);

    await collection.insertOne(sanitizedData as SanitizedRecipe);
    return json({ message: "Recipe added successfully", recipe: sanitizedData }, { status: 201 });
  } catch (error) {
    return json({ error }, { status: 500 });
  }
}
