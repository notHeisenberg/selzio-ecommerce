import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection URI
const uri = process.env.MONGODB_URI;

// Database and collection names
const DB_NAME = "selzio_business";
const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  REVIEWS: "reviews",
  CATEGORIES: "categories",
  WISHLIST: "wishlist",
  COMBOS: "combos"
};

// MongoDB Client options
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

// Create a MongoClient
let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Helper functions to access database and collections
export async function getDatabase() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

export async function getCollection(collectionName) {
  const db = await getDatabase();
  return db.collection(collectionName);
}

// Export collections accessors
export async function getUsersCollection() {
  return getCollection(COLLECTIONS.USERS);
}

export async function getProductsCollection() {
  return getCollection(COLLECTIONS.PRODUCTS);
}

export async function getCombosCollection() {
  return getCollection(COLLECTIONS.COMBOS);
}

export async function getOrdersCollection() {
  return getCollection(COLLECTIONS.ORDERS);
}

export async function getReviewsCollection() {
  return getCollection(COLLECTIONS.REVIEWS);
}

export async function getCategoriesCollection() {
  return getCollection(COLLECTIONS.CATEGORIES);
}

export async function getWishlistCollection() {
  return getCollection(COLLECTIONS.WISHLIST);
}

// Export the client and clientPromise for direct access if needed
export { client, clientPromise, COLLECTIONS }; 