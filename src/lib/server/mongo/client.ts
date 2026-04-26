import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

let clientPromise: Promise<MongoClient> | undefined;

function getMongoClient() {
  const uri = env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getMongoDatabase(dbName?: string) {
  const client = await getMongoClient();
  return client.db(dbName);
}