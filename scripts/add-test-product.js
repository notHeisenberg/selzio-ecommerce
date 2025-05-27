// Script to add a test product to the database
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Test products to insert
const testProducts = [
  {
    productCode: 'EL-WHPN',
    name: 'Premium Wireless Headphones',
    description: 'Experience crystal clear sound with our premium wireless headphones. Features noise cancellation and long battery life.',
    price: 149.99,
    category: 'Electronics',
    subcategory: 'Audio',
    stock: 25,
    discount: 10,
    rating: 4.7,
    reviews: 120,
    image: '/images/products/headphones.jpg',
    tags: ['wireless', 'headphones', 'audio', 'bluetooth'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    productCode: 'FA-WTCH',
    name: 'Luxury Wristwatch',
    description: 'An elegant luxury wristwatch with precision timekeeping and premium materials.',
    price: 299.99,
    category: 'Fashion',
    subcategory: 'Accessories',
    stock: 15,
    discount: 0,
    rating: 4.9,
    reviews: 85,
    image: '/images/products/watch.jpg',
    tags: ['watch', 'luxury', 'accessories', 'fashion'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('selzio_business');
    const collection = db.collection('products');
    
    // Try to find the products first
    for (const product of testProducts) {
      const existing = await collection.findOne({ productCode: product.productCode });
      
      if (existing) {
        console.log(`Product with code ${product.productCode} already exists`);
        console.log('Existing product:', existing);
      } else {
        // Insert the product
        const result = await collection.insertOne(product);
        console.log(`Inserted product with code ${product.productCode}`);
        console.log('Insert result:', result);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

run().catch(console.error); 