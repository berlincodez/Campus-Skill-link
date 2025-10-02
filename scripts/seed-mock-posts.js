// Script to seed MongoDB with mock posts from lib/mock-store.js
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');


// Load mock posts from lib/mock-posts.json
const mockPostsPath = path.join(__dirname, '../lib/mock-posts.json');
let posts;
try {
  posts = JSON.parse(fs.readFileSync(mockPostsPath, 'utf-8'));
} catch (e) {
  console.error('Failed to load mock-posts.json:', e);
  process.exit(1);
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const dbName = process.env.MONGODB_DB || 'campus_skilllink';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('posts');
    await collection.deleteMany({});
    await collection.insertMany(posts);
    console.log('Seeded mock posts to MongoDB!');
  } catch (err) {
    console.error('Error seeding posts:', err);
  } finally {
    await client.close();
  }
}

seed();
