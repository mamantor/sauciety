import { json } from "@sveltejs/kit";
import { getMongoDatabase } from "$lib/mongo/client.js";

const db = getMongoDatabase()

const collection = db.collection("recipes");

export async function POST({ request }) {
  try {
    const data = await request.json();
    if (!data.title || !data.ingredients.length || !data.instructions.length) {
      return json({ error: "Invalid data" }, { status: 400 });
    }

    await collection.insertOne(data);
    return json({ message: "Recipe added successfully" }, { status: 201 });
  } catch (error) {
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
}
