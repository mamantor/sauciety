import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

const MONGODB_URI = env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!clientPromise) {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export async function getMongoDatabase(dbName?: string) {
  const c = await clientPromise;
  return c.db(dbName);
}