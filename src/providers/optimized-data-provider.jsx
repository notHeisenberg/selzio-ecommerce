"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const DataContext = createContext();

// Cache duration constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (increased from 1 for better performance)
const HTTP_CACHE_DURATION = 60; // 1 minute in seconds

// Global cache to prevent duplicate requests across component instances
let globalCache = {
  homepage: { data: null, timestamp: 0, loading: false },
  products: { data: null, timestamp: 0, loading: false }
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
  'Perfume Oil': '/images/categories/Perfume_Oils_All.jpg',
  'Sweat shirts': '/images/categories/Premium_Sweatshirt_all.jpg',
};

export const OptimizedDataProvider = ({ children }) => {
  const [data, setData] = useState({
    // Homepage specific data (loads first)
    topSellingProducts: [],
    featuredCategories: [],
    featuredCombos: [],
    testimonials: [], // Reviews for testimonials section

    // Full data (loads after if needed)
    products: [],
    categories: [],
    combos: [],

    // Loading states
    homepageLoading: true,
    fullDataLoading: false,
    initialized: false,
    error: null
  });

  // Check if cache is still valid
  const isCacheValid = useCallback((cacheKey) => {
    return globalCache[cacheKey]?.data &&
      Date.now() - globalCache[cacheKey].timestamp < CACHE_DURATION;
  }, []);

  // Derive categories from products
  const deriveCategories = useCallback((products) => {
    const uniqueSubcategories = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
    return uniqueSubcategories.map(name => ({
      name,
      href: `/products/${createSlug(name)}`
    }));
  }, []);

  // Build featured categories with full info
  const buildFeaturedCategories = useCallback((categoryData) => {
    return categoryData.map((cat, index) => {
      const categorySlug = createSlug(cat.category);
      const subcatSlug = createSlug(cat.name);
      const image = defaultImages[cat.name] || '/images/categories/Old_money_all.png';

      return {
        id: cat.id || index + 1,
        name: cat.name,
        image: image,
        count: cat.count || 0,
        description: `Shop our ${cat.name} collection`,
        href: `/products/${categorySlug}/${subcatSlug}`,
        discount: cat.discount || 0
      };
    });
  }, []);

  // Load homepage data FIRST (optimized endpoint)
  const loadHomepageData = useCallback(async () => {
    try {
      // Return cached data if valid
      if (isCacheValid('homepage')) {
        setData(prev => ({
          ...prev,
          ...globalCache.homepage.data,
          homepageLoading: false,
          initialized: true
        }));
        return;
      }

      // Prevent multiple simultaneous requests
      if (globalCache.homepage.loading) {
        while (globalCache.homepage.loading) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        if (isCacheValid('homepage')) {
          setData(prev => ({
            ...prev,
            ...globalCache.homepage.data,
            homepageLoading: false,
            initialized: true
          }));
          return;
        }
      }

      globalCache.homepage.loading = true;
      setData(prev => ({ ...prev, homepageLoading: true, error: null }));

      // Single optimized API call for homepage
      const response = await fetch('/api/homepage-data', {
        credentials: 'same-origin',
        headers: {
          'Cache-Control': `public, max-age=${HTTP_CACHE_DURATION}, stale-while-revalidate=600`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch homepage data');
      }

      const homepageData = await response.json();

      // Build featured categories with full info
      const featuredCategories = buildFeaturedCategories(homepageData.featuredCategories || []);

      const processedData = {
        topSellingProducts: homepageData.topSellingProducts || [],
        featuredCategories: featuredCategories,
        featuredCombos: homepageData.featuredCombos || [],
        testimonials: homepageData.testimonials || [],
      };

      // Update global cache
      globalCache.homepage = {
        data: processedData,
        timestamp: Date.now(),
        loading: false
      };

      setData(prev => ({
        ...prev,
        ...processedData,
        homepageLoading: false,
        initialized: true
      }));

    } catch (error) {
      console.error('Failed to load homepage data:', error);
      const errorData = {
        topSellingProducts: [],
        featuredCategories: [],
        featuredCombos: [],
        testimonials: [],
        homepageLoading: false,
        initialized: true,
        error: 'Failed to load homepage data'
      };

      globalCache.homepage = {
        data: errorData,
        timestamp: Date.now(),
        loading: false
      };

      setData(prev => ({ ...prev, ...errorData }));
    }
  }, [isCacheValid, buildFeaturedCategories]);

  // Load full products data (for other pages, lazy loaded)
  const loadFullProductsData = useCallback(async () => {
    try {
      // Return cached data if valid
      if (isCacheValid('products')) {
        setData(prev => ({
          ...prev,
          ...globalCache.products.data,
          fullDataLoading: false
        }));
        return globalCache.products.data;
      }

      // Prevent multiple simultaneous requests
      if (globalCache.products.loading) {
        while (globalCache.products.loading) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        if (isCacheValid('products')) {
          setData(prev => ({
            ...prev,
            ...globalCache.products.data,
            fullDataLoading: false
          }));
          return globalCache.products.data;
        }
      }

      globalCache.products.loading = true;
      setData(prev => ({ ...prev, fullDataLoading: true }));

      // Fetch full product and combo data
      const [productsRes, combosRes] = await Promise.allSettled([
        fetch('/api/products?limit=50', {
          credentials: 'same-origin',
          headers: {
            'Cache-Control': `public, max-age=${HTTP_CACHE_DURATION}, stale-while-revalidate=300`
          }
        }),
        fetch('/api/combos?limit=20', {
          credentials: 'same-origin',
          headers: {
            'Cache-Control': `public, max-age=${HTTP_CACHE_DURATION}, stale-while-revalidate=300`
          }
        })
      ]);

      let products = [];
      let combos = [];

      // Handle products response
      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const productsData = await productsRes.value.json();
        products = productsData.products || [];
      }

      // Handle combos response
      if (combosRes.status === 'fulfilled' && combosRes.value.ok) {
        const combosData = await combosRes.value.json();
        combos = combosData.combos || [];
      }

      // Derive other data from products
      const categories = deriveCategories(products);

      const processedData = {
        products,
        categories,
        combos,
        fullDataLoading: false
      };

      // Update global cache
      globalCache.products = {
        data: processedData,
        timestamp: Date.now(),
        loading: false
      };

      setData(prev => ({ ...prev, ...processedData }));
      return processedData;

    } catch (error) {
      console.error('Failed to load full products data:', error);
      setData(prev => ({ ...prev, fullDataLoading: false }));
      return null;
    }
  }, [isCacheValid, deriveCategories]);

  // Initialize with homepage data first
  useEffect(() => {
    loadHomepageData();
  }, [loadHomepageData]);

  // Auto-load full products data after homepage loads (for Navbar, etc.)
  useEffect(() => {
    // After homepage data is loaded, automatically load full data in background
    if (data.initialized && !data.homepageLoading && data.products.length === 0 && !data.fullDataLoading) {
      // Use setTimeout to avoid updating state during render
      const timer = setTimeout(() => {
        loadFullProductsData();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [data.initialized, data.homepageLoading, data.products.length, data.fullDataLoading, loadFullProductsData]);

  // Memoized helper functions
  const getTopSellingProducts = useCallback((limit = 4) => {
    // If full products loaded, use that; otherwise use homepage data
    if (data.products.length > 0) {
      return data.products.filter(p => p.topSelling).slice(0, limit);
    }
    return data.topSellingProducts.slice(0, limit);
  }, [data.products, data.topSellingProducts]);

  const getCategorizedSubcategories = useCallback(() => {
    // Return empty array if data isn't loaded yet
    // Don't trigger loading during render - that causes React errors
    if (data.products.length === 0) {
      return [];
    }

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
    // Invalidate all caches
    globalCache = {
      homepage: { data: null, timestamp: 0, loading: false },
      products: { data: null, timestamp: 0, loading: false }
    };

    // Reload both homepage and full data to ensure everything is fresh
    await Promise.all([
      loadHomepageData(),
      loadFullProductsData()
    ]);
  }, [loadHomepageData, loadFullProductsData]);

  // Expose a function to load full data on demand
  const ensureFullDataLoaded = useCallback(() => {
    if (data.products.length === 0 && !data.fullDataLoading) {
      return loadFullProductsData();
    }
    return Promise.resolve(data);
  }, [data, loadFullProductsData]);

  const value = useMemo(() => ({
    // Homepage data (always available immediately)
    topSellingProducts: data.topSellingProducts,
    featuredCategories: data.featuredCategories,
    combos: data.featuredCombos, // For homepage, show featured combos
    testimonials: data.testimonials, // Reviews for testimonials section

    // Full data (lazy loaded)
    products: data.products,
    categories: data.categories,
    allCombos: data.combos,

    // Loading states
    loading: data.homepageLoading, // Main loading state for homepage
    fullDataLoading: data.fullDataLoading,
    initialized: data.initialized,
    error: data.error,

    // Helper functions
    getTopSellingProducts,
    getCategorizedSubcategories,
    refresh,
    ensureFullDataLoaded,
  }), [
    data,
    getTopSellingProducts,
    getCategorizedSubcategories,
    refresh,
    ensureFullDataLoaded
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an OptimizedDataProvider');
  }
  return context;
};

