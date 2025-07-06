"use client";

import { useState, useEffect, useCallback } from "react";
import { getProducts, getCategories } from "@/data/products";
import { getCombos } from "@/data/combos";
import { ProductCard } from "@/components/products/product-card";
import { ComboCard } from "@/components/home/combo-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Metadata } from "next";
import { metadata } from "./metadata"
import { Navbar } from "@/components/layout/navbar";
import { FiltersBar, CategoryFilter } from "@/components/filters";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";

// Cannot use metadata in client components, would need a separate
// metadata.js file or move this to a server component if metadata is needed

export default function StorePage() {
  // State for all filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [stockFilter, setStockFilter] = useState("all");
  const [sortOption, setSortOption] = useState("featured");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [combos, setCombos] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [showCombos, setShowCombos] = useState(true);
  const { isVisible, scrollDirection } = useScrollDirection({ isNavbar: false });

  // Load combos
  const loadCombos = async () => {
    try {
      setLoadingCombos(true);
      const combosData = await getCombos();
      setCombos(combosData);
    } catch (err) {
      console.error('Failed to load combos:', err);
    } finally {
      setLoadingCombos(false);
    }
  };

  // Load products from MongoDB via products.js
  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await getProducts();
      setAllProducts(products);
      setFilteredProducts(products);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadProducts();
    loadCombos();
    
    // Check if user has a preference for showing/hiding combos
    const savedShowCombos = localStorage.getItem("showCombosInStore");
    if (savedShowCombos !== null) {
      setShowCombos(savedShowCombos === "true");
    }
  }, []);

  // Save combo visibility preference
  useEffect(() => {
    localStorage.setItem("showCombosInStore", showCombos.toString());
  }, [showCombos]);

  // Toggle combo visibility
  const toggleCombosVisibility = useCallback(() => {
    setShowCombos(prev => !prev);
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    let result = [...allProducts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(product => {
        // Core search fields always checked
        if (
          (product.name && product.name.toLowerCase().includes(query)) ||
          (product.productCode && product.productCode.toLowerCase().includes(query)) ||
          (product.description && product.description.toLowerCase().includes(query)) ||
          (product.category && product.category.toLowerCase().includes(query)) ||
          (product.subcategory && product.subcategory.toLowerCase().includes(query))
        ) {
          return true;
        }
        
        // Check tags array
        if (product.tags && Array.isArray(product.tags)) {
          if (product.tags.some(tag => tag.toLowerCase().includes(query))) {
            return true;
          }
        }
        
        // Check SKU
        if (product.sku && product.sku.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check brand
        if (product.brand && product.brand.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check material
        if (product.material && product.material.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check size variations
        if (product.sizes && Array.isArray(product.sizes)) {
          if (product.sizes.some(size => 
            (size.name && size.name.toLowerCase().includes(query))
          )) {
            return true;
          }
        }
        
        // Check color variations
        if (product.colors && Array.isArray(product.colors)) {
          if (product.colors.some(color => 
            (color.name && color.name.toLowerCase().includes(query))
          )) {
            return true;
          }
        }
        
        // Check additional info fields
        if (product.additionalInfo) {
          const additionalInfo = product.additionalInfo;
          if (typeof additionalInfo === 'object') {
            return Object.values(additionalInfo).some(value => 
              value && typeof value === 'string' && value.toLowerCase().includes(query)
            );
          } else if (typeof additionalInfo === 'string') {
            return additionalInfo.toLowerCase().includes(query);
          }
        }
        
        return false;
      });
    }

    // Apply subcategory filter
    if (selectedSubcategory && selectedSubcategory !== "all") {
      result = result.filter((product) => product.subcategory === selectedSubcategory);
    }
    
    // Apply stock filter
    if (stockFilter !== "all") {
      result = result.filter(
        (product) => stockFilter === "in-stock" ? product.stock > 0 : product.stock === 0
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
        // Sort by createdAt date if available
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
        // Featured - default sorting (could be customized)
        result.sort((a, b) => (b.topSelling ? 1 : 0) - (a.topSelling ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedSubcategory, priceRange, stockFilter, sortOption, allProducts]);

  // Get unique subcategories from products
  const uniqueSubcategories = [...new Set(allProducts.map((product) => product.subcategory).filter(Boolean))];

  // Reset all filters
  const handleResetAllFilters = () => {
    setSearchQuery("");
    setSelectedSubcategory("all");
    setPriceRange([0, 3000]);
    setStockFilter("all");
    setSortOption("featured");
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Page title */}
        <h1 className="text-3xl font-bold mb-6">Store</h1>

        {/* Combined filters bar */}
        <FiltersBar
          searchQuery={searchQuery}
          onSearchChange={(e) => {
            // Ensure we're handling both event objects and direct values
            const value = e && typeof e === 'object' && e.target ? e.target.value : e;
            setSearchQuery(value);
          }}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          onResetAllFilters={handleResetAllFilters}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceStep={50}
          categories={uniqueSubcategories}
          selectedCategory={selectedSubcategory}
          onCategorySelect={setSelectedSubcategory}
          className="mb-6"
          searchPlaceholder="Search by name, code, tag, color..."
        />
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar for subcategories - Desktop only */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 space-y-6">
              <div className="p-4">
                <h3 className="font-medium mb-3 text-lg">Products</h3>
                <CategoryFilter
                  categories={uniqueSubcategories}
                  selectedCategory={selectedSubcategory}
                  onSelectCategory={setSelectedSubcategory}
                  showAllOption={true}
                  allCategoryLabel="All Products"
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className={cn(
              "sticky top-0 z-10 flex flex-wrap justify-between items-center mb-4 py-2 px-1 border-b bg-background/90 backdrop-blur-md",
              "transition-all duration-300",
              scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
            )}>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> results
              </p>
              
              <div className="flex gap-2 flex-wrap">
                {searchQuery && (
                  <span className="text-xs px-1">
                    Search: <span className="font-medium">{searchQuery}</span>
                  </span>
                )}
                
                {selectedSubcategory !== "all" && (
                  <span className="text-xs px-1">
                    Category: <span className="font-medium">{selectedSubcategory}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Combos Section with Toggle */}
            {combos.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    {
                      showCombos && (
                        <h2 className="text-xl font-medium">Special Combos</h2>
                      )
                    }
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleCombosVisibility}
                      className="p-1 h-auto"
                      title={showCombos ? "Hide combos" : "Show combos"}
                    >
                      {showCombos ? (
                        <>
                        <span>Hide combos</span>
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        </>
                      ) : (
                        <>
                        <span>Show combos</span>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        </>
                      )}
                    </Button>
                  </div>
                  {
                    showCombos && (
                      <Link href="/combos">
                        <Button variant="outline" className="text-sm rounded-none">View All Combos</Button>
                      </Link>
                    )
                  }
                </div>
                
                {showCombos && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {loadingCombos ? (
                        Array(3).fill(0).map((_, index) => (
                          <div key={`combo-skeleton-${index}`} className="animate-pulse">
                            <div className="bg-secondary/70 h-[250px] rounded-none"></div>
                          </div>
                        ))
                      ) : (
                        combos.slice(0, 3).map((combo, index) => (
                          <ComboCard key={combo.comboCode} combo={combo} index={index} />
                        ))
                      )}
                    </div>
                    <div className="border-b mt-8 mb-8"></div>
                  </>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {Array(6).fill(0).map((_, index) => (
                  <div key={`skeleton-${index}`} className="animate-pulse">
                    <div className="bg-secondary/70 h-[250px] sm:h-[300px] rounded-none"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <h3 className="text-xl font-medium mb-2">Error loading products</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.productCode || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="w-full"
                  >
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleResetAllFilters}
                >
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 