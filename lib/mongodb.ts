import { MongoClient, ServerApiVersion } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable (set it in Project Settings).")
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export const mongoClientPromise = global._mongoClientPromise ?? client.connect()

if (process.env.NODE_ENV !== "production") {
  global._mongoClientPromise = mongoClientPromise
}

export async function getDb() {
  const client = await mongoClientPromise
  const dbName = process.env.MONGODB_DB || "campus_skilllink"
  return client.db(dbName)
}
