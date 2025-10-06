import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Dummy promise for build time
  clientPromise = Promise.reject(new Error('MongoDB URI not configured'));
}

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  if (!uri) {
    throw new Error('MongoDB URI not configured. Please set MONGODB_URI environment variable.');
  }
  const client = await clientPromise;
  return client.db('todolist');
}
