"use client"

import { useState, useEffect } from 'react';

// Cached products data
let productsCache = [];
let categoriesCache = [];
let featuredCategoriesCache = [];
let isLoading = false;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to create URL-friendly slugs
export const createSlug = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Function to generate product URL
export const getProductUrl = (product) => {
  const productSlug = createSlug(product.name);
  const categorySlug = createSlug(product.category);
  const subcategorySlug = product.subcategory ? createSlug(product.subcategory) : null;
  
  return subcategorySlug
    ? `/products/${categorySlug}/${subcategorySlug}/${productSlug}?code=${product.productCode}`
    : `/products/${categorySlug}/${productSlug}?code=${product.productCode}`;
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
    // Fetch products from API
    const response = await fetch('/api/products?limit=100');
    
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
    
    // Create featured categories
    featuredCategoriesCache = [
      {
        id: 1,
        name: 'Electronics',
        image: '/categories/electronics.jpg',
        count: productsCache.filter(p => p.category === 'Electronics').length,
        description: 'Latest gadgets and tech accessories',
        href: '/products/electronics'
      },
      {
        id: 2,
        name: 'Fashion',
        image: '/categories/fashion.jpg',
        count: productsCache.filter(p => p.category === 'Fashion' || p.category === 'Men\'s Fashion' || p.category === 'Women\'s Fashion').length,
        description: 'Trendy clothing and accessories',
        href: '/products/fashion'
      },
      {
        id: 3,
        name: 'Home & Living',
        image: '/categories/home.jpg',
        count: productsCache.filter(p => p.category === 'Home & Living').length,
        description: 'Make your home beautiful',
        href: '/products/home-living'
      },
      {
        id: 4,
        name: 'Beauty',
        image: '/categories/beauty.jpg',
        count: productsCache.filter(p => p.category === 'Beauty').length,
        description: 'Premium beauty products',
        href: '/products/beauty'
      }
    ];
    
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
  const { categories } = await initializeProducts();
  return categories;
};

// Async function to get featured categories
export const getFeaturedCategories = async () => {
  const { featuredCategories } = await initializeProducts();
  return featuredCategories;
};

// Get top selling products
export const getTopSellingProducts = async (limit = 4) => {
  try {
    const response = await fetch(`/api/products?topSelling=true&limit=${limit}`);
    
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
    const response = await fetch(`/api/products/${productCode}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with code ${productCode}:`, error);
    // Try to find in cache as fallback
    const { products } = await initializeProducts();
    return products.find(p => p.productCode === productCode);
  }
};

// Search products
export const searchProducts = async (query, limit = 10) => {
  try {
    const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=${limit}`);
    
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