"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext();

// Cache duration constants
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const HTTP_CACHE_DURATION = 600; // 10 minutes in seconds

// Global cache to prevent duplicate requests across component instances
let globalCache = {
  data: null,
  timestamp: 0,
  loading: false
};

// Helper function to create URL-friendly slugs
const createSlug = (text) => {
  if (!text) return '';
  const withHyphens = text.trim().toLowerCase().replace(/\s+/g, '-');
  return withHyphens.replace(/[^a-z0-9-]+/g, '-').replace(/--+/g, '-').replace(/(^-|-$)/g, '');
};

// Default images mapping for subcategories
const defaultImages = {
  'Old Money': '/images/categories/Old_money_all.png',
  'Perfume Oils': '/images/categories/Perfume_Oils_All.jpg',
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    products: [],
    categories: [],
    featuredCategories: [],
    combos: [],
    loading: true,
    initialized: false,
    error: null
  });

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    return globalCache.data && 
           Date.now() - globalCache.timestamp < CACHE_DURATION;
  }, []);

  // Derive categories from products
  const deriveCategories = useCallback((products) => {
    const uniqueSubcategories = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
    return uniqueSubcategories.map(name => ({
      name,
      href: `/products/${createSlug(name)}`
    }));
  }, []);

  // Derive featured categories from products with discount calculation
  const deriveFeaturedCategories = useCallback((products) => {
    const uniqueSubcategories = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
    
    return uniqueSubcategories.slice(0, 6).map((subcat, index) => {
      const count = products.filter(p => p.subcategory === subcat).length;
      const categoryProduct = products.find(p => p.subcategory === subcat);
      const category = categoryProduct ? categoryProduct.category : '';
      
      const categorySlug = createSlug(category);
      const subcatSlug = createSlug(subcat);
      
      const image = defaultImages[subcat] || '/images/categories/Old_money_all.png';
      
      // Calculate discount for this category
      const categoryProducts = products.filter(product => 
        product.subcategory === subcat && product.discount > 0
      );
      
      let discount = 0;
      if (categoryProducts.length > 0) {
        const maxDiscount = Math.max(...categoryProducts.map(p => p.discount));
        discount = Math.min(Math.round(maxDiscount / 5) * 5, 50); // Round to nearest 5, cap at 50%
      }
      
      return {
        id: index + 1,
        name: subcat,
        image: image,
        count: count,
        description: `Shop our ${subcat} collection`,
        href: `/products/${categorySlug}/${subcatSlug}`,
        discount: discount
      };
    });
  }, []);

  // Initialize app data with optimized caching
  const initializeAppData = useCallback(async () => {
    try {
      // Return cached data if valid
      if (isCacheValid()) {
        setData({
          ...globalCache.data,
          loading: false,
          initialized: true
        });
        return;
      }

      // Prevent multiple simultaneous requests
      if (globalCache.loading) {
        // Wait for existing request to complete
        while (globalCache.loading) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (isCacheValid()) {
          setData({
            ...globalCache.data,
            loading: false,
            initialized: true
          });
          return;
        }
      }

      globalCache.loading = true;
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Create optimized API requests with proper caching headers
      const [productsRes, combosRes] = await Promise.allSettled([
        fetch('/api/products?limit=100', {
          credentials: 'same-origin',
          headers: {
            'Cache-Control': `public, max-age=${HTTP_CACHE_DURATION}, stale-while-revalidate=300`
          }
        }),
        fetch('/api/combos?featured=true&limit=10', {
          credentials: 'same-origin',
          headers: {
            'Cache-Control': `public, max-age=${HTTP_CACHE_DURATION}, stale-while-revalidate=300`
          }
        })
      ]);

      let products = [];
      let combos = [];
      let errors = [];

      // Handle products response
      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const productsData = await productsRes.value.json();
        products = productsData.products || [];
      } else {
        errors.push('Failed to load products');
        console.error('Products fetch failed:', productsRes.reason || 'Unknown error');
      }

      // Handle combos response
      if (combosRes.status === 'fulfilled' && combosRes.value.ok) {
        const combosData = await combosRes.value.json();
        combos = combosData.combos || [];
      } else {
        errors.push('Failed to load combos');
        console.error('Combos fetch failed:', combosRes.reason || 'Unknown error');
      }

      // Derive other data from products (in memory, no additional API calls)
      const categories = deriveCategories(products);
      const featuredCategories = deriveFeaturedCategories(products);

      const processedData = {
        products,
        categories,
        featuredCategories,
        combos,
        loading: false,
        initialized: true,
        error: errors.length > 0 ? errors.join(', ') : null
      };

      // Update global cache
      globalCache = {
        data: processedData,
        timestamp: Date.now(),
        loading: false
      };

      setData(processedData);
    } catch (error) {
      console.error('Failed to initialize app data:', error);
      const errorData = {
        products: [],
        categories: [],
        featuredCategories: [],
        combos: [],
        loading: false,
        initialized: true,
        error: 'Failed to load app data'
      };
      
      globalCache = {
        data: errorData,
        timestamp: Date.now(),
        loading: false
      };
      
      setData(errorData);
    }
  }, [isCacheValid, deriveCategories, deriveFeaturedCategories]);

  useEffect(() => {
    initializeAppData();
  }, [initializeAppData]);

  // Memoized helper functions
  const getTopSellingProducts = useCallback((limit = 4) => {
    return data.products.filter(p => p.topSelling).slice(0, limit);
  }, [data.products]);

  const getCategorizedSubcategories = useCallback(() => {
    const subcategoriesByCategory = {};
    
    data.products.forEach(product => {
      if (product.category && product.subcategory) {
        const categoryName = product.category.trim();
        const subcategoryName = product.subcategory.trim();
        
        if (!subcategoriesByCategory[categoryName]) {
          subcategoriesByCategory[categoryName] = new Set();
        }
        subcategoriesByCategory[categoryName].add(subcategoryName);
      }
    });
    
    return Object.entries(subcategoriesByCategory).map(([category, subcategories]) => ({
      category,
      subcategories: Array.from(subcategories).map(subcategory => ({
        name: subcategory,
        href: `/products/${createSlug(category)}/${createSlug(subcategory)}`
      })).sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.category.localeCompare(b.category));
  }, [data.products]);

  // Force refresh function (bypasses cache)
  const refresh = useCallback(async () => {
    globalCache = { data: null, timestamp: 0, loading: false };
    await initializeAppData();
  }, [initializeAppData]);

  const value = {
    ...data,
    getTopSellingProducts,
    getCategorizedSubcategories,
    refresh
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a DataProvider');
  }
  return context;
};
