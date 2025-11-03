"use client"

// Cached combos data
let combosCache = [];
let isLoading = false;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to invalidate the cache (to be called when combos are updated)
export const invalidateCombosCache = () => {
  combosCache = [];
  lastFetchTime = 0;
  console.log('Combos cache invalidated');
  
  // Dispatch a custom event to notify components to refetch
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('combos-cache-invalidated'));
  }
};

// Function to generate combo URL
export const getComboUrl = (combo) => {
  return `/combos/${combo.comboCode}`;
};

// Initialize combos - this will be called by components that need combo data
export const initializeCombos = async () => {
  const currentTime = Date.now();
  
  // Return cached data if available and not expired
  if (combosCache.length > 0 && currentTime - lastFetchTime < CACHE_DURATION) {
    return { combos: combosCache };
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
    
    return { combos: combosCache };
  }

  isLoading = true;
  
  try {
    // Fetch combos from API with cache busting
    const response = await fetch('/api/combos?limit=100&t=' + Date.now(), {
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
    combosCache = data.combos || [];
    
    // Process combos to ensure they have both images array and image field
    combosCache = combosCache.map(combo => {
      // If combo has images array but no image field, use first image
      if (!combo.image && combo.images && combo.images.length > 0) {
        combo.image = combo.images[0];
      }
      // If combo has image field but no images array, create one
      if (!combo.images || !Array.isArray(combo.images) || combo.images.length === 0) {
        combo.images = combo.image ? [combo.image] : ['/images/product-placeholder.jpg'];
      }
      return combo;
    });
    
    lastFetchTime = Date.now();
    return { combos: combosCache };
  } catch (error) {
    console.error("Error fetching combos:", error);
    // Return empty arrays on error
    return { combos: [] };
  } finally {
    isLoading = false;
  }
};

// Async function to get all combos
export const getCombos = async () => {
  const { combos } = await initializeCombos();
  return combos;
};

// Async function to get featured combos
export const getFeaturedCombos = async (limit = 3) => {
  try {
    const response = await fetch(`/api/combos?featured=true&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process combos to ensure they have both images array and image field
    const processedCombos = data.combos.map(combo => {
      // If combo has images array but no image field, use first image
      if (!combo.image && combo.images && combo.images.length > 0) {
        combo.image = combo.images[0];
      }
      // If combo has image field but no images array, create one
      if (!combo.images || !Array.isArray(combo.images) || combo.images.length === 0) {
        combo.images = combo.image ? [combo.image] : ['/images/product-placeholder.jpg'];
      }
      return combo;
    });
    
    return processedCombos;
  } catch (error) {
    console.error("Error fetching featured combos:", error);
    // Fallback to cached combos if API fails
    const { combos } = await initializeCombos();
    return combos.filter(c => c.featured).slice(0, limit);
  }
};

// Fetch a single combo by combo code
export const getComboByCode = async (comboCode) => {
  try {
    if (!comboCode) {
      console.error('No comboCode provided to getComboByCode');
      return null;
    }
    
    const apiUrl = `/api/combos/${comboCode}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const combo = await response.json();
    
    // Process combo to ensure it has both images array and image field
    if (!combo.image && combo.images && combo.images.length > 0) {
      combo.image = combo.images[0];
    }
    
    if (!combo.images || !Array.isArray(combo.images) || combo.images.length === 0) {
      combo.images = combo.image ? [combo.image] : ['/images/product-placeholder.jpg'];
    }
    
    return combo;
  } catch (error) {
    console.error(`Error fetching combo with code ${comboCode}:`, error);
    // Try to find in cache as fallback
    const { combos } = await initializeCombos();
    const cachedCombo = combos.find(c => c.comboCode === comboCode);
    return cachedCombo;
  }
}; 
