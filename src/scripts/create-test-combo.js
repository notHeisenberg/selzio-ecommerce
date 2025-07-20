// Script to add a test 3-polo combo to the database
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function createTestCombo() {
  // Connection URI
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set!');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    // Get database and collection
    const db = client.db("selzio_business");
    const combosCollection = db.collection("combos");
    const productsCollection = db.collection("products");
    
    // Fetch some polo products for the combo
    const poloProducts = await productsCollection
      .find({ 
        category: "Fashion",
        tags: { $in: ["polo", "shirt"] }
      })
      .limit(5)
      .toArray();

    if (poloProducts.length < 3) {
      // Create a test combo with mock product codes
      const testCombo = {
        comboCode: 'CMB-TESTPOLO',
        name: '3-Polo Old Money Combo',
        description: 'Classic 3-polo combo with premium old money designs. Mix and match colors and sizes for the perfect casual look.',
        price: 3999.99,
        basePrice: 1000.00, // Base price before adding individual product prices
        image: '/images/categories/Old_money_all.png',
        featured: true,
        discount: 15,
        productOptions: [
          'FA-POLO1',
          'FA-POLO2', 
          'FA-POLO3',
          'FA-POLO4',
          'FA-POLO5'
        ],
        suggestedCombinations: [
          {
            name: 'Classic Mix',
            products: ['FA-POLO1', 'FA-POLO3', 'FA-POLO5'],
            sizes: ['M', 'M', 'M']
          },
          {
            name: 'Varied Sizes',
            products: ['FA-POLO2', 'FA-POLO4', 'FA-POLO1'],
            sizes: ['S', 'M', 'L']
          }
        ],
        tags: ['polo', 'combo', 'old money', 'fashion'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to database
      const result = await combosCollection.insertOne(testCombo);
      
    } else {
      // Get product codes
      const productCodes = poloProducts.map(p => p.productCode);
      
      // Create a real combo with actual product codes
      const realCombo = {
        comboCode: 'CMB-POLO3X',
        name: '3-Polo Old Money Combo',
        description: 'Classic 3-polo combo with premium old money designs. Mix and match colors and sizes for the perfect casual look.',
        price: 3999.99,
        basePrice: 1000.00, // Base price before adding individual product prices
        image: '/images/categories/Old_money_all.png',
        featured: true,
        discount: 15,
        productOptions: productCodes,
        suggestedCombinations: [
          {
            name: 'Classic Mix',
            products: [productCodes[0], productCodes[1], productCodes[2]],
            sizes: ['M', 'M', 'M']
          },
          {
            name: 'Varied Sizes',
            products: [productCodes[0], productCodes[1], productCodes[2]],
            sizes: ['S', 'M', 'L']
          }
        ],
        tags: ['polo', 'combo', 'old money', 'fashion'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to database
      const result = await combosCollection.insertOne(realCombo);
        
      
    }

  } catch (error) {
    console.error('Error creating combo:', error);
  } finally {
    await client.close();

  }
}

createTestCombo()
  .then(() => console.log('Test combo creation complete'))
  .catch(err => console.error('Error in test combo creation script:', err)); 