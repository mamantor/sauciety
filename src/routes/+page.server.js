import { getMongoDatabase } from "$lib/mongo/client"

export async function load() {

    const db = await getMongoDatabase('sauciety')

    const collection = db.collection("recipes");
    const generalCollection = db.collection('general');
    const recipes = await collection.aggregate([
        {
            $group: {
                _id: "$category", // Grouping by category
                items: {
                    $push: { title: "$title", slug: "$slug", legend: "$legend", cookTime: "$cooktime", servings: "$servings", _id : { $toString: "$_id" }} // Collecting title and slug for each document
                }
            }
        }
    ]).toArray()
    const tocOrder = ["meal", "desert"]

    recipes.sort((a, b) => {
        // Get the index of each category in the custom order.
        // If a category is not found, assign a high index to sort it at the end.
        const indexA = tocOrder.indexOf(a._id) !== -1 ? tocOrder.indexOf(a._id) : Number.MAX_VALUE;
        const indexB = tocOrder.indexOf(b._id) !== -1 ? tocOrder.indexOf(b._id) : Number.MAX_VALUE;
        return indexA - indexB;
    });
    const general = await generalCollection.findOne({}, { projection: { _id: 0, bookName: 1 } });


    return {
        recipes,
        general
    }
};