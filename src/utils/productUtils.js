import { getProductsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Update product statistics when an order is placed
 * @param {Array} orderItems - Array of order items
 * @param {string} operation - 'add' for placing order, 'subtract' for cancelling order
 */
export async function updateProductStats(orderItems, operation = 'add') {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    console.warn('⚠️ No order items provided for product stats update');
    return;
  }

  const productsCollection = await getProductsCollection();
  const bulkOps = [];

  for (const item of orderItems) {
    const itemQuantity = parseInt(item.quantity) || 1;
    const itemPrice = parseFloat(item.price) || 0;
    const totalItemRevenue = itemQuantity * itemPrice;
    
    console.log(`📊 ${operation === 'add' ? 'Adding' : 'Subtracting'} stats for: ${item.name || item.productCode}`, {
      quantity: itemQuantity,
      price: itemPrice,
      revenue: totalItemRevenue
    });
    
    // Try to find product by productCode or _id
    let productQuery = {};
    if (item.productCode) {
      productQuery.productCode = item.productCode;
    } else if (item.id && ObjectId.isValid(item.id)) {
      productQuery._id = new ObjectId(item.id);
    } else {
      console.warn('⚠️ No valid product identifier found for item:', item);
      continue;
    }
    
    const multiplier = operation === 'add' ? 1 : -1;
    
    // Add bulk operation to update product
    bulkOps.push({
      updateOne: {
        filter: productQuery,
        update: {
          $inc: {
            stock: -itemQuantity * multiplier, // Decrease stock when adding order, increase when cancelling
            orders: itemQuantity * multiplier, // Increase order count when adding, decrease when cancelling
            revenue: totalItemRevenue * multiplier // Increase revenue when adding, decrease when cancelling
          },
          $set: {
            updatedAt: new Date()
          }
        }
      }
    });
  }
  
  // Execute bulk operations if we have any
  if (bulkOps.length > 0) {
    try {
      const bulkResult = await productsCollection.bulkWrite(bulkOps);
      console.log(`✅ Product bulk update result (${operation}):`, {
        modifiedCount: bulkResult.modifiedCount,
        upsertedCount: bulkResult.upsertedCount,
        matchedCount: bulkResult.matchedCount
      });
      return bulkResult;
    } catch (bulkError) {
      console.error(`❌ Error updating product statistics (${operation}):`, bulkError);
      throw bulkError;
    }
  }
}

/**
 * Get product by identifier (productCode or _id)
 * @param {string} identifier - Product code or _id
 * @returns {Object|null} Product object or null if not found
 */
export async function getProductByIdentifier(identifier) {
  if (!identifier) return null;
  
  const productsCollection = await getProductsCollection();
  
  // Try to find by productCode first
  let product = await productsCollection.findOne({ productCode: identifier });
  
  // If not found and identifier is a valid ObjectId, try finding by _id
  if (!product && ObjectId.isValid(identifier)) {
    product = await productsCollection.findOne({ _id: new ObjectId(identifier) });
  }
  
  return product;
}

/**
 * Check if products have sufficient stock for an order
 * @param {Array} orderItems - Array of order items
 * @returns {Object} Result object with success status and details
 */
export async function checkProductStock(orderItems) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return { success: false, message: 'No items to check' };
  }

  const stockIssues = [];
  
  for (const item of orderItems) {
    const product = await getProductByIdentifier(item.productCode || item.id);
    
    if (!product) {
      stockIssues.push({
        item: item.name || item.productCode || item.id,
        issue: 'Product not found'
      });
      continue;
    }
    
    const requestedQuantity = parseInt(item.quantity) || 1;
    const availableStock = parseInt(product.stock) || 0;
    
    if (availableStock < requestedQuantity) {
      stockIssues.push({
        item: product.name || item.name,
        requested: requestedQuantity,
        available: availableStock,
        issue: 'Insufficient stock'
      });
    }
  }
  
  if (stockIssues.length > 0) {
    return {
      success: false,
      message: 'Stock issues found',
      issues: stockIssues
    };
  }
  
  return { success: true, message: 'All items have sufficient stock' };
}
