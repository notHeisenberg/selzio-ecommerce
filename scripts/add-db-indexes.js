/**
 * Script to add MongoDB indexes for optimal query performance
 * Run this script once to create indexes: node scripts/add-db-indexes.js
 */

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const DB_NAME = "selzio_business";

async function addIndexes() {
  // Remove strict mode to allow text indexes
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false, // Changed from true to allow text indexes
      deprecationErrors: false,
    }
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Products collection indexes
    console.log('\n📦 Creating indexes for products collection...');
    const productsCollection = db.collection('products');
    
    await productsCollection.createIndex(
      { topSelling: 1, createdAt: -1 },
      { name: 'idx_topSelling_createdAt' }
    );
    console.log('✓ Created index: topSelling + createdAt');

    await productsCollection.createIndex(
      { category: 1, subcategory: 1 },
      { name: 'idx_category_subcategory' }
    );
    console.log('✓ Created index: category + subcategory');

    await productsCollection.createIndex(
      { subcategory: 1 },
      { name: 'idx_subcategory' }
    );
    console.log('✓ Created index: subcategory');

    await productsCollection.createIndex(
      { productCode: 1 },
      { name: 'idx_productCode', unique: true }
    );
    console.log('✓ Created index: productCode (unique)');

    await productsCollection.createIndex(
      { tags: 1 },
      { name: 'idx_tags' }
    );
    console.log('✓ Created index: tags');

    // Text indexes (optional - for search functionality)
    try {
      await productsCollection.createIndex(
        { name: 'text', description: 'text' },
        { name: 'idx_text_search' }
      );
      console.log('✓ Created text index: name + description');
    } catch (err) {
      if (err.code === 323) {
        console.log('⚠️  Skipped text index (API strict mode - not critical)');
      } else {
        throw err;
      }
    }

    // Reviews collection indexes
    console.log('\n⭐ Creating indexes for reviews collection...');
    const reviewsCollection = db.collection('reviews');

    await reviewsCollection.createIndex(
      { rating: -1, createdAt: -1 },
      { name: 'idx_rating_createdAt' }
    );
    console.log('✓ Created index: rating + createdAt');

    await reviewsCollection.createIndex(
      { productCode: 1, createdAt: -1 },
      { name: 'idx_productCode_createdAt' }
    );
    console.log('✓ Created index: productCode + createdAt');

    await reviewsCollection.createIndex(
      { productCode: 1, rating: -1 },
      { name: 'idx_productCode_rating' }
    );
    console.log('✓ Created index: productCode + rating');

    await reviewsCollection.createIndex(
      { verified: 1 },
      { name: 'idx_verified' }
    );
    console.log('✓ Created index: verified');

    // Combos collection indexes
    console.log('\n🎁 Creating indexes for combos collection...');
    const combosCollection = db.collection('combos');

    await combosCollection.createIndex(
      { featured: 1, createdAt: -1 },
      { name: 'idx_featured_createdAt' }
    );
    console.log('✓ Created index: featured + createdAt');

    await combosCollection.createIndex(
      { comboCode: 1 },
      { name: 'idx_comboCode', unique: true }
    );
    console.log('✓ Created index: comboCode (unique)');

    // Orders collection indexes
    console.log('\n📋 Creating indexes for orders collection...');
    const ordersCollection = db.collection('orders');

    await ordersCollection.createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'idx_userId_createdAt' }
    );
    console.log('✓ Created index: userId + createdAt');

    await ordersCollection.createIndex(
      { orderNumber: 1 },
      { name: 'idx_orderNumber', unique: true }
    );
    console.log('✓ Created index: orderNumber (unique)');

    await ordersCollection.createIndex(
      { status: 1 },
      { name: 'idx_status' }
    );
    console.log('✓ Created index: status');

    // Users collection indexes
    console.log('\n👤 Creating indexes for users collection...');
    const usersCollection = db.collection('users');

    await usersCollection.createIndex(
      { email: 1 },
      { name: 'idx_email', unique: true }
    );
    console.log('✓ Created index: email (unique)');

    // Wishlist collection indexes
    console.log('\n❤️  Creating indexes for wishlist collection...');
    const wishlistCollection = db.collection('wishlist');

    await wishlistCollection.createIndex(
      { userId: 1 },
      { name: 'idx_userId' }
    );
    console.log('✓ Created index: userId');

    await wishlistCollection.createIndex(
      { userId: 1, productCode: 1 },
      { name: 'idx_userId_productCode', unique: true }
    );
    console.log('✓ Created index: userId + productCode (unique)');

    console.log('\n✅ All indexes created successfully!');
    console.log('\n📊 Listing all indexes:');

    // List all indexes
    const collections = ['products', 'combos', 'reviews', 'orders', 'users', 'wishlist'];
    for (const collName of collections) {
      const coll = db.collection(collName);
      const indexes = await coll.indexes();
      console.log(`\n${collName}:`);
      indexes.forEach(idx => {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
addIndexes();

