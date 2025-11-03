"use client"

import { useState, useEffect } from 'react';

// Cached products data
let productsCache = [];
let categoriesCache = [];
let featuredCategoriesCache = [];
let isLoading = false;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to invalidate the cache (to be called when products are updated)
export const invalidateProductsCache = () => {
  const previousCacheSize = productsCache.length;
  productsCache = [];
  categoriesCache = [];
  featuredCategoriesCache = [];
  lastFetchTime = 0;
  
  // Dispatch a custom event to notify components to refetch
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('products-cache-invalidated'));
  }
};

// Helper function to create URL-friendly slugs
export const createSlug = (text) => {
  if (!text) return '';
  
  // Explicitly convert spaces to hyphens first to ensure consistent behavior
  const withHyphens = text.trim().toLowerCase().replace(/\s+/g, '-');
  
  // Then handle other special characters and clean up any duplicate or trailing hyphens
  return withHyphens.replace(/[^a-z0-9-]+/g, '-').replace(/--+/g, '-').replace(/(^-|-$)/g, '');
};

// Function to generate product URL
export const getProductUrl = (product) => {
  const categorySlug = createSlug(product.category);
  const subcategorySlug = product.subcategory ? createSlug(product.subcategory) : null;
  
  return subcategorySlug
    ? `/products/${categorySlug}/${subcategorySlug}/${product.productCode}`
    : `/products/${categorySlug}/${product.productCode}`;
};

// Navigation items
export const navItems = [
  { name: "Home", href: "/" },
  { name: "Store", href: "/store" },
  { name: "Contact", href: "/contact" },
];

// Initialize products - this will be called by components that need product data
export const initializeProducts = async () => {
  const currentTime = Date.now();
  
  // Return cached data if available and not expired
  if (productsCache.length > 0 && currentTime - lastFetchTime < CACHE_DURATION) {
    return {
      products: productsCache,
      categories: categoriesCache,
      featuredCategories: featuredCategoriesCache
    };
  }

  // Avoid multiple simultaneous fetches
  if (isLoading) {
    // Wait for existing fetch to complete
    await new Promise(resolve => {
      const checkCache = () => {
        if (!isLoading) {
          resolve();
        } else {
          setTimeout(checkCache, 100);
        }
      };
      checkCache();
    });
    
    return {
      products: productsCache,
      categories: categoriesCache,
      featuredCategories: featuredCategoriesCache
    };
  }

  isLoading = true;
  
  try {
    // Fetch products from API with cache busting
    const response = await fetch('/api/products?limit=100&t=' + Date.now(), {
      credentials: 'same-origin', // Include cookies
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    productsCache = data.products || [];
    
    // Derive categories from products
    const uniqueCategories = [...new Set(productsCache.map(p => p.category))];
    categoriesCache = uniqueCategories.map(name => ({
      name,
      href: `/products/${createSlug(name)}`
    }));
    
    // We'll dynamically create featured categories in getFeaturedCategories()
    // to ensure they match actual product data
    featuredCategoriesCache = [];
    
    lastFetchTime = Date.now();
    return {
      products: productsCache,
      categories: categoriesCache,
      featuredCategories: featuredCategoriesCache
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty arrays on error
    return { products: [], categories: [], featuredCategories: [] };
  } finally {
    isLoading = false;
  }
};

// Async function to get all products
export const getProducts = async () => {
  const { products } = await initializeProducts();
  return products;
};

// Async function to get categories
export const getCategories = async () => {
  const { products } = await initializeProducts();
  // Extract unique subcategories and create proper format
  const uniqueSubcategories = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
  return uniqueSubcategories.map(name => ({
    name,
    href: `/products/${createSlug(name)}`
  }));
};

// Default images mapping for subcategories
const defaultImages = {
  // Fashion subcategories
  'Old Money': '/images/categories/Old_money_all.png',
  'Perfume Oils': '/images/categories/Perfume_Oils_All.jpg',
};

// Async function to get featured categories
export const getFeaturedCategories = async () => {
  const { products } = await initializeProducts();
  
  // Get unique subcategories
  const uniqueSubcategories = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
  
  // Create featured subcategory objects with appropriate image paths
  return uniqueSubcategories.map((subcat, index) => {
    // Get count of products in this subcategory
    const count = products.filter(p => p.subcategory === subcat).length;
    
    // Determine category from first product with this subcategory
    const categoryProduct = products.find(p => p.subcategory === subcat);
    const category = categoryProduct ? categoryProduct.category : '';
    
    // Create slug for href
    const categorySlug = createSlug(category);
    const subcatSlug = createSlug(subcat);
    
    // Get image from defaultImages mapping or fall back to Old Money image
    const image = defaultImages[subcat] || '/images/categories/Old_money_all.png';
    
    return {
      id: index + 1,
      name: subcat,
      image: image,
      count: count,
      description: `Shop our ${subcat} collection`,
      href: `/products/${categorySlug}/${subcatSlug}`
    };
  });
};

// Get top selling products
export const getTopSellingProducts = async (limit = 8) => {
  try {
    const response = await fetch(`/api/products?topSelling=true&limit=${limit}`, {
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    // Fallback to cached products if API fails
    const { products } = await initializeProducts();
    return products.filter(p => p.topSelling).slice(0, limit);
  }
};

// Fetch a single product by product code
export const getProductByCode = async (productCode) => {
  try {

    
    if (!productCode) {
      console.error('No productCode provided to getProductByCode');
      return null;
    }
    
    const apiUrl = `/api/products/${productCode}`;
    
    const response = await fetch(apiUrl, {
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error(`Error fetching product with code ${productCode}:`, error);
    // Try to find in cache as fallback
    const { products } = await initializeProducts();
    const cachedProduct = products.find(p => p.productCode === productCode);
    return cachedProduct;
  }
};

// Search products
export const searchProducts = async (query, limit = 10) => {
  try {
    const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=${limit}`, {
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error searching products:", error);
    // Fallback to local filtering
    const { products } = await initializeProducts();
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(lowerQuery)) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    ).slice(0, limit);
  }
};

// Get related products
export const getRelatedProducts = async (productCode, limit = 4) => {
  try {
    if (!productCode) {
      console.error('No productCode provided to getRelatedProducts');
      return [];
    }
    
    const apiUrl = `/api/products?relatedTo=${encodeURIComponent(productCode)}&excludeProductCode=${encodeURIComponent(productCode)}&limit=${limit}`;

    
    const response = await fetch(apiUrl, {
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error(`Error fetching related products for ${productCode}:`, error);
    
    // Fallback to local filtering
    try {
      const { products } = await initializeProducts();
      const sourceProduct = products.find(p => p.productCode === productCode);
      
      if (!sourceProduct) return [];
      
      // MUST match same category (mandatory filter)
      let relatedProducts = products.filter(p => 
        p.productCode !== productCode && 
        p.category === sourceProduct.category
      );
      
      // If no products in same category, return empty
      if (relatedProducts.length === 0) return [];
      
      // PREFER same subcategory if exists
      if (sourceProduct.subcategory) {
        const sameSubcategory = relatedProducts.filter(p => 
          p.subcategory === sourceProduct.subcategory
        );
        
        // Use subcategory matches if available, otherwise use category matches
        if (sameSubcategory.length > 0) {
          relatedProducts = sameSubcategory;
        }
      }
      
      // Create a ranking function to prioritize within same category/subcategory
      const getRelevanceScore = (product) => {
        let score = 0;
        
        // Subcategory match (if not already filtered)
        if (sourceProduct.subcategory && product.subcategory === sourceProduct.subcategory) {
          score += 50;
        }
        
        // Top selling products get priority
        if (product.topSelling) score += 30;
        
        // Tag matches (each matching tag adds points)
        if (sourceProduct.tags && product.tags) {
          const matchingTags = sourceProduct.tags.filter(tag => product.tags.includes(tag));
          score += matchingTags.length * 10;
        }
        
        return score;
      };
      
      // Calculate scores, sort by score, and take top N
      return relatedProducts
        .map(p => ({ ...p, relevanceScore: getRelevanceScore(p) }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (fallbackError) {
      console.error('Fallback related products fetching failed:', fallbackError);
      return [];
    }
  }
}; 