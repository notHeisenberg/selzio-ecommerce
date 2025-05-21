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

const SearchBar = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const spinnerRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

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
    // Get product URL using the centralized function
    const route = getProductUrl(result);

    // Navigate to the product page
    router.push(route);
    setIsFocused(false);
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

  // Search function using the searchProducts function from products.js
  const searchProductsFromAPI = async (query) => {
    setIsSearching(true);
    try {
      // Call the searchProducts function
      const results = await searchProducts(query);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      searchProductsFromAPI(debouncedSearch);
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

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative w-full group">
        <Search className={cn(
          "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300",
          isFocused ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )} />
        <Input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={cn(
            "w-full pl-10 py-5 bg-card/50 border-border rounded-md transition-all duration-300",
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-sm rounded-md shadow-lg border border-border max-h-96 overflow-y-auto z-50">
          {searchResults.map((result) => (
            <div
              key={result.productCode}
              onMouseEnter={handleResultHover}
              onMouseLeave={handleResultLeave}
              onClick={() => handleResultClick(result)}
              className="p-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 result-image">
                  <Image
                    src={result.image}
                    alt={result.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 result-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {result.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {result.category} {result.subcategory && `· ${result.subcategory}`}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-primary ml-2">
                      ${result.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.stock > 10 ? 'In Stock' : result.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {isFocused && searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-sm rounded-md shadow-lg border border-border p-3">
          <p className="text-sm text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 