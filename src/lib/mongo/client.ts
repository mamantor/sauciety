import { MongoClient, Db } from "mongodb";

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'sauciety';

const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db(DB_NAME);

export function getMongoDatabase(): Db {
    return db
}