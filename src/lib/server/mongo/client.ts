import { MongoClient, type Db } from 'mongodb';
import { env } from '$env/dynamic/private';

let clientPromise: Promise<MongoClient> | undefined;

function getMongoClient() {
  const uri = env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect().catch((err) => {
      // Let a future call retry instead of permanently reusing a rejected connection.
      clientPromise = undefined;
      throw err;
    });

    clientPromise.then((connectedClient) => {
      connectedClient
        .db('sauciety')
        .collection('recipes')
        .createIndex({ slug: 1 }, { unique: true })
        .catch((err) => console.error('Failed to ensure recipes.slug unique index:', err));
    });
  }

  return clientPromise;
}

export async function getMongoDatabase(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}