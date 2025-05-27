"use client"

import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProductDetail from '@/components/products/ProductDetail';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Search, SlidersHorizontal, Filter, Star, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { generateBreadcrumbs } from '@/components/layout/breadcrumbs';
import { getProductByCode, getProducts } from '@/data/products';
import { ProductCard } from '@/components/products/product-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PriceRangeSlider } from '@/components/ui/price-range-slider';

export default function ProductCatchAllPage() {
  const params = useParams();
  const pathname = usePathname();
  const { category, slug } = params;
  const [product, setProduct] = useState(null);
  
  // States for product listing (subcategory view)
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState(null);

  // Filter states for subcategory view
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minPriceInput, setMinPriceInput] = useState("0");
  const [maxPriceInput, setMaxPriceInput] = useState("5000");
  const [sortOption, setSortOption] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Format category for display (capitalize first letter)
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Determine if we're showing a product page or subcategory page
  const isLikelyProductCode = slug.length === 1 && /^[A-Z]{2}-[A-Z]{4}$/.test(slug[0]);
  const isProductWithSubcategory = slug.length === 2;
  const isSubcategoryPage = slug.length === 1 && !isLikelyProductCode;
  
  // Current subcategory (if applicable) - handle URL formats
  const rawSubcategory = isSubcategoryPage ? slug[0] : '';
  // First decode URL encoding, then normalize format (handles both spaces and hyphens)
  const decodedSubcategory = isSubcategoryPage ? decodeURIComponent(rawSubcategory) : '';
  
  // Normalize subcategory for display - convert hyphens to spaces and capitalize words
  const subcategory = decodedSubcategory;
  const displaySubcategory = decodedSubcategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Helper function to normalize strings for comparison
  const normalizeString = (str) => {
    if (!str) return '';
    
    // Handle special cases for men's and women's fashion
    if (str.toLowerCase() === 'men-s-fashion') return "men's fashion";
    if (str.toLowerCase() === 'women-s-fashion') return "women's fashion";
    
    // Regular normalization
    return str.toLowerCase().trim();
  };
  
  // Helper for subcategory matching across all categories
  const matchSubcategory = (productSubcategory, urlSubcategory, productCategory) => {
    if (!productSubcategory || !urlSubcategory) return false;
    
    // Special case for smart-home
    if (urlSubcategory.toLowerCase() === 'smart-home' && 
        productSubcategory.toLowerCase().replace(/\s+/g, '-') === 'smart-home') {
      return true;
    }
    
    // Normalize for comparison
    const normalizedProductSubcat = normalizeString(productSubcategory);
    let normalizedUrlSubcat = normalizeString(urlSubcategory);
    
    // Handle URLs with hyphens by replacing them with spaces for matching
    normalizedUrlSubcat = normalizedUrlSubcat.replace(/-/g, ' ');
    
    // Direct match
    if (normalizedProductSubcat === normalizedUrlSubcat) return true;
    
    // Category-specific variations mapping
    const categoryVariations = {
      // Fashion subcategories
      "men's fashion": {
        'shirts': ['shirt', 'tshirt', 't-shirt', 't shirt'],
        'pants': ['pant', 'trousers', 'jeans'],
        'suits': ['suit', 'blazer', 'formal wear'],
        'accessories': ['accessory', 'jewelry', 'watch'],
        'shoes': ['shoe', 'footwear', 'sneaker'],
        'casual wear': ['casual', 'casual clothes', 'casuals'],
      },
      "women's fashion": {
        'dresses': ['dress', 'gown'],
        'tops': ['top', 'blouse', 'shirt'],
        'bottoms': ['bottom', 'skirt', 'pant', 'pants', 'jeans'],
      },
      // Electronics subcategories
      "electronics": {
        'smart home': ['smart-home', 'smarthome', 'smart devices', 'home automation'],
        'computers': ['computer', 'laptop', 'desktop', 'pc'],
        'accessories': ['accessory', 'peripheral', 'gadget'],
        'tvs': ['tv', 'television', 'smart tv'],
      },
    };
    
    // Get variations for the current category, or use an empty object if none defined
    const categoryName = normalizeString(productCategory);
    const variations = categoryVariations[categoryName] || {};
    
    // Check if any variations match
    for (const [base, variants] of Object.entries(variations)) {
      if (normalizedProductSubcat === base && variants.includes(normalizedUrlSubcat)) {
        return true;
      }
      if (normalizedUrlSubcat === base && variants.includes(normalizedProductSubcat)) {
        return true;
      }
    }
    
    // Partial matching as a fallback
    if (normalizedProductSubcat.includes(normalizedUrlSubcat) || 
        normalizedUrlSubcat.includes(normalizedProductSubcat)) {
      return true;
    }
    
    return false;
  };
  
  // Fetch product data when we have a product code
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        let productCode = null;
        
        if (isProductWithSubcategory) {
          // /products/[category]/[subcategory]/[productCode]
          productCode = slug[1];
        } else if (isLikelyProductCode) {
          // /products/[category]/[productCode]
          productCode = slug[0];
        }
        
        if (productCode) {
          const data = await getProductByCode(productCode);
          setProduct(data);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoadingProduct(false);
      }
    };
    
    if (isProductWithSubcategory || isLikelyProductCode) {
      fetchProduct();
    }
  }, [slug, isLikelyProductCode, isProductWithSubcategory]);
  
  // Fetch products for subcategory view
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await getProducts();
        setAllProducts(products);
        
        
        // Initial filtering by category and subcategory
        let filtered = products.filter(p => 
          normalizeString(p.category) === normalizeString(category)
        );
        
        if (isSubcategoryPage) {
          
          // Try with special case for Smart Home
          if (subcategory.toLowerCase() === 'smart home') {
            filtered = filtered.filter(p => 
              p.subcategory && 
              (p.subcategory.toLowerCase() === 'smart home' || 
               p.subcategory.toLowerCase().replace(/\s+/g, '-') === 'smart-home')
            );
          } else {
            // Normal case
            filtered = filtered.filter(p => {
              if (!p.subcategory) return false;
              
              const isMatch = matchSubcategory(p.subcategory, subcategory, p.category);
              return isMatch;
            });
          }
        }
        
        setFilteredProducts(filtered);
        
        // Set dynamic price range based on actual product prices
        if (filtered.length > 0) {
          const suggestedHighPrice = Math.max(...filtered.map(p => p.price));
          // We'll set the initial max to the highest price, but user can change it to any value
          setPriceRange([0, suggestedHighPrice]);
          setMaxPriceInput(suggestedHighPrice.toString());
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isSubcategoryPage) {
      fetchProducts();
    }
  }, [category, subcategory, isSubcategoryPage]);
  
  // Apply filters whenever any filter changes
  useEffect(() => {
    if (!isSubcategoryPage || allProducts.length === 0) return;
    
    // Filter by category AND subcategory
    let result = allProducts.filter(p => {
      const categoryMatch = normalizeString(p.category) === normalizeString(category);
      
      // Only check subcategory if the product has one
      let subcategoryMatch = false;
      if (p.subcategory) {
        subcategoryMatch = matchSubcategory(p.subcategory, subcategory, p.category);
      }
      
      return categoryMatch && subcategoryMatch;
    });

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) => {
          // Basic search in name and description
          const basicMatch = 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query);
          
          // Tag search - more important for fashion categories
          const tagMatch = product.tags && product.tags.some(tag => 
            tag.toLowerCase().includes(query)
          );
          
          // Special search for fashion categories
          const isFashionCategory = ["men's fashion", "women's fashion"].includes(
            normalizeString(product.category)
          );
          
          if (isFashionCategory) {
            // For fashion, also search in subcategory and any additional properties
            const fashionMatch = 
              (product.subcategory && product.subcategory.toLowerCase().includes(query)) ||
              (product.color && product.color.toLowerCase().includes(query)) ||
              (product.size && product.size.toLowerCase().includes(query)) ||
              (product.style && product.style.toLowerCase().includes(query));
              
            return basicMatch || tagMatch || fashionMatch;
          }
          
          return basicMatch || tagMatch;
        }
      );
    }

    // Apply price range filter
    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortOption) {
      case "price-low-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Featured - default sorting (top selling first)
        result.sort((a, b) => (b.topSelling ? 1 : 0) - (a.topSelling ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [searchQuery, priceRange, sortOption, isSubcategoryPage, allProducts, category, subcategory]);
  
  // Get max price for range slider
  const maxPrice = allProducts.length > 0 
    ? Math.max(...allProducts.map((product) => product.price))
    : 5000;
  
  // Generate breadcrumb items based on the current path and product data
  const breadcrumbItems = generateBreadcrumbs(params, pathname, product?.name);
  
  // Custom handler for price input changes - allow any max value
  const handlePriceInputChange = (type, value) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (type === 'min') {
      setMinPriceInput(numericValue);
      // Only update slider if input is valid
      if (numericValue !== '') {
        const newMin = parseInt(numericValue, 10);
        // Enforce minimum limit of 0
        if (!isNaN(newMin) && newMin >= 0) {
          setPriceRange([newMin, priceRange[1]]);
        }
      }
    } else {
      setMaxPriceInput(numericValue);
      // Only update slider if input is valid
      if (numericValue !== '') {
        const newMax = parseInt(numericValue, 10);
        // Allow any maximum value as long as it's >= min
        if (!isNaN(newMax) && newMax >= priceRange[0]) {
          setPriceRange([priceRange[0], newMax]);
        }
      }
    }
  };

  // Apply price inputs when user presses Enter
  const handlePriceInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      const min = parseInt(minPriceInput, 10) || 0;
      // No max limit - use whatever user entered or a high default
      const max = parseInt(maxPriceInput, 10) || 50000;
      
      // Enforce min >= 0 and min <= max
      const validMin = Math.max(0, min);
      if (validMin <= max) {
        setPriceRange([validMin, max]);
      } else {
        // If max < min, set max = min
        setPriceRange([validMin, validMin]);
        setMaxPriceInput(validMin.toString());
      }
      // Always ensure min is at least 0
      if (min < 0) {
        setMinPriceInput('0');
      }
    }
  };

  // Reset price range to defaults
  const resetPriceRange = () => {
    const defaultMax = allProducts.length > 0 
      ? Math.max(...allProducts.map(product => product.price))
      : 5000;
    
    setPriceRange([0, defaultMax]);
    setMinPriceInput("0");
    setMaxPriceInput(defaultMax.toString());
  };
  
  // Format price with currency symbol and commas
  const formatPrice = (price) => {
    return `${price.toLocaleString('en-US')} BDT`;
  };
  
  // Update input fields when slider changes
  useEffect(() => {
    setMinPriceInput(priceRange[0].toString());
    setMaxPriceInput(priceRange[1].toString());
  }, [priceRange]);
  
  // Product detail view
  if (isProductWithSubcategory || isLikelyProductCode) {
    let productCode = isProductWithSubcategory ? slug[1] : slug[0];
    
    return (
      <>
        <PageHeader breadcrumbItems={breadcrumbItems} />
        <ProductDetail productCode={productCode} />
      </>
    );
  } 
  
  // Subcategory view
  if (isSubcategoryPage) {
    return (
      <>
        <PageHeader breadcrumbItems={breadcrumbItems} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{displaySubcategory}</h1>
              <p className="text-muted-foreground">
                Browse {displaySubcategory} in {displayCategory} ({filteredProducts.length} products)
              </p>
            </div>
            
            {/* Search bar */}
            <div className="w-full md:w-auto mt-4 md:mt-0 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in this subcategory..."
                  className="pl-10 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filters and Sort Controls */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            {/* Mobile Filters */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Price Range</h3>
                    <div className="px-2">
                      <PriceRangeSlider
                        value={priceRange}
                        onChange={setPriceRange}
                        showLabel={false}
                      />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Price Filter */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium whitespace-nowrap">Price:</span>
                <div className="w-[180px]">
                  <PriceRangeSlider
                    value={priceRange}
                    onChange={setPriceRange}
                    showLabel={false}
                    size="sm"
                    showSteps={false} 
                    showTooltip={false}
                  />
                </div>
              </div>
            </div>

            {/* Sort Control */}
            <div>
              <Select 
                value={sortOption} 
                onValueChange={setSortOption}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-secondary/50"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-secondary/50 rounded"></div>
                    <div className="h-4 w-1/2 bg-secondary/50 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.productCode} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? `No products match "${searchQuery}" in this subcategory.` 
                  : `No products found in the ${displaySubcategory} subcategory.`}
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setPriceRange([0, maxPrice]);
              }}>
                Reset Filters
              </Button>
            </div>
          )}
          
          {/* Back to Category Link */}
          <div className="mt-8">
            <Link href={`/products/${category}`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {displayCategory} category
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  // Fallback for any other cases
  return <div>Invalid product path</div>;
} 