"use client"

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import gsap from 'gsap';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { searchProducts, getProductUrl } from '@/data/products';
import { getCombos } from '@/data/combos';

// Helper function to get the display image from various possible formats
const getDisplayImage = (result) => {
  // For combo items
  if (result.isCombo) {
    // Use combo image directly or first from array
    return result.image || 
           (result.images && result.images.length > 0 ? result.images[0] : '/images/product-placeholder.jpg');
  }
  
  // For products - handle image arrays
  if (Array.isArray(result.image)) {
    return result.image.length > 0 ? result.image[0] : '/images/product-placeholder.jpg';
  }
  
  // Handle case where image is directly on the product object
  if (result.image) {
    return result.image;
  }
  
  // If product has images array
  if (Array.isArray(result.images) && result.images.length > 0) {
    return result.images[0];
  }
  
  // Final fallback
  return '/images/product-placeholder.jpg';
};

const SearchBar = ({ onResultClick }) => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const spinnerRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 300); // Reduced debounce time for more responsiveness

  // GSAP hover animations
  const handleResultHover = (e) => {
    const result = e.currentTarget;
    const image = result.querySelector('.result-image');
    const content = result.querySelector('.result-content');

    // Add classes instead of setting hsl values directly
    result.classList.add('bg-secondary');
    
    gsap.to(image, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    });

    gsap.to(content, {
      x: 4,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleResultLeave = (e) => {
    const result = e.currentTarget;
    const image = result.querySelector('.result-image');
    const content = result.querySelector('.result-content');

    // Remove classes instead of setting hsl values directly
    result.classList.remove('bg-secondary');
    
    gsap.to(image, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });

    gsap.to(content, {
      x: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleResultClick = (result) => {
    if (result.isCombo) {
      // Navigate to combo page
      router.push(`/combos/${result.comboCode}`);
    } else {
      // Navigate to product page
      const route = getProductUrl(result);
      router.push(route);
    }
    setIsFocused(false);
    setSearchQuery(''); // Clear search after navigating
    
    // Call the onResultClick prop if provided
    if (onResultClick) {
      onResultClick();
    }
  };

  useEffect(() => {
    if (!spinnerRef.current) return;
    
    // Create spinner elements
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'spinner-dot';
      spinner.appendChild(dot);
    }
    
    spinnerRef.current.appendChild(spinner);

    // GSAP animation for the dots
    const dots = spinner.querySelectorAll('.spinner-dot');
    const tl = gsap.timeline({ repeat: -1 });
    
    dots.forEach((dot, index) => {
      tl.to(dot, {
        y: -8,
        duration: 0.4,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1,
        delay: index * 0.15
      }, 0);
    });

    return () => {
      tl.kill();
      if (spinner.parentNode) {
        spinner.remove();
      }
    };
  }, []);

  // Search function that includes both products and combos
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Search for products
      const products = await searchProducts(query);
      
      // Search for combos
      const allCombos = await getCombos();
      
      // Filter combos based on query
      const query_lower = query.toLowerCase().trim();
      const combos = allCombos.filter(combo => 
        (combo.name && combo.name.toLowerCase().includes(query_lower)) ||
        (combo.description && combo.description.toLowerCase().includes(query_lower)) ||
        (combo.comboCode && combo.comboCode.toLowerCase().includes(query_lower))
      );
      
      // Prepare combos with the right structure
      const formattedCombos = combos.map(combo => ({
        ...combo,
        isCombo: true,
        // No need to set image property here as getDisplayImage will handle it
      }));
      
      // Combine and limit results
      const combinedResults = [...formattedCombos, ...products].slice(0, 8);
      
      setSearchResults(combinedResults || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Clear search and results when clicking the escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setSearchQuery('');
        setIsFocused(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative w-full group">
        <Search className={cn(
          "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300",
          isFocused ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )} />
        <Input
          type="search"
          placeholder="Search products & combos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={cn(
            "w-full pl-10 py-5 bg-card/50 border-border rounded-none transition-all duration-300",
            "focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary focus-visible:ring-primary",
            isSearching && "pr-10"
          )}
        />
        <div 
          ref={spinnerRef} 
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            !isSearching && "hidden"
          )}
        />
      </div>

      {/* Search Results Dropdown */}
      {isFocused && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-sm rounded-none shadow-lg border border-border max-h-96 overflow-y-auto z-50">
          {searchResults.map((result) => (
            <div
              key={result.isCombo ? `combo-${result.comboCode}` : `product-${result.productCode}`}
              onMouseEnter={handleResultHover}
              onMouseLeave={handleResultLeave}
              onClick={() => handleResultClick(result)}
              className="p-3 cursor-pointer hover:bg-secondary/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-none overflow-hidden flex-shrink-0 result-image border border-border">
                  <Image
                    src={getDisplayImage(result)}
                    alt={result.name || 'Product Image'}
                    fill
                    sizes="48px"
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/product-placeholder.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 result-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {result.name}
                        {result.isCombo && <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-none">Combo</span>}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {!result.isCombo ? (
                          <>
                            {result.category} {result.subcategory && `· ${result.subcategory}`}
                          </>
                        ) : (
                          'Special Combo Offer'
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-primary ml-2">
                      {result.price ? `${result.price.toFixed(2)} BDT` : ''}
                    </span>
                  </div>
                  {!result.isCombo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.stock > 10 ? 'In Stock' : result.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {isFocused && searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-sm rounded-none shadow-lg border border-border p-3">
          <p className="text-sm text-muted-foreground">No products or combos found</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 