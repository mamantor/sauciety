import { json, error } from "@sveltejs/kit";
import { getMongoDatabase } from "$lib/server/mongo/client";
import { ObjectId, Binary } from "mongodb";

export type SanitizedRecipe = {
  title: string;
  ingredients: string[];
  instructions: string[];
  description?: string;
  image?: {
    data: Binary;
    contentType: string;
    filename: string;
    size: number;
  };
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

export async function POST(event) {

  const session = await event.locals.auth();


  if (!session?.user) {
    throw error(401, "Unauthorized");
  }

  const db = await getMongoDatabase('sauciety')

  const collection = db.collection("recipes");

  const request = event.request;


  try {
    const data = await request.formData();

    const title = data.get("title")?.toString() || "";
    const ingredients = JSON.parse(data.get("ingredients")?.toString() || "");
    const instructions = JSON.parse(data.get("instructions")?.toString() || "");
    const notes = JSON.parse(data.get("notes")?.toString() || "");
    const editId = data.get("editId")?.toString() || "";

    if (!title || !ingredients.length || !instructions.length) {
      return json({ error: "Invalid data" }, { status: 400 });
    }

    const sanitizedData: Partial<SanitizedRecipe> = {
      category: String(data.get('category') ?? ''),
      title,
      legend: String(data.get('legend') ?? ''),
      author: String(data.get('author') ?? ''),
      timeUnit: String(data.get('timeUnit') ?? ''),
      servings: Number(data.get('servings') ?? 0),
      cooktime: Number(data.get('cooktime') ?? 0),
      vegetarian: data.get('vegetarian') === 'true',
      vegan: data.get('vegan') === 'true',
      ingredients: Array.isArray(ingredients) ? ingredients.map(String) : [],
      instructions: Array.isArray(instructions) ? instructions.map(String) : [],
      notes: Array.isArray(notes) ? notes.map(String) : [],
    };

    const imageFile = data.get('image');

    if (imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      sanitizedData.image = {
        data: new Binary(buffer),
        contentType: imageFile.type,
        filename: imageFile.name,
        size: imageFile.size
      };

    }

    // Generate slug from title
    sanitizedData.slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (editId) {
      await collection.updateOne({ _id: new ObjectId(editId) }, { $set: sanitizedData });
      return json({ message: "Recipe updated successfully", recipe: sanitizedData }, { status: 200 });
    } else {

      await collection.insertOne(sanitizedData as SanitizedRecipe);
    }
    return json({ message: "Recipe added successfully", recipe: sanitizedData }, { status: 201 });
  } catch (error) {
    console.error(error);
    return json({ error: "Invalid request" }, { status: 500 });
  }
}
