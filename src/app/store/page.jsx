"use client";

import { useState, useEffect } from "react";
import { getProducts, getCategories } from "@/data/products";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Metadata } from "next";
import { metadata } from "./metadata"
import { Navbar } from "@/components/layout/navbar";
import { PriceRangeSlider } from "@/components/ui/price-range-slider";

// Cannot use metadata in client components, would need a separate
// metadata.js file or move this to a server component if metadata is needed

export default function StorePage() {
  // State for all filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortOption, setSortOption] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products from MongoDB via products.js
  useEffect(() => {
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

    loadProducts();
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    let result = [...allProducts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.subcategory && product.subcategory.toLowerCase().includes(query)) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Apply subcategory filter
    if (selectedSubcategory) {
      result = result.filter((product) => product.subcategory === selectedSubcategory);
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
  }, [searchQuery, selectedSubcategory, priceRange, sortOption, allProducts]);

  // Get unique subcategories from products
  const uniqueSubcategories = [...new Set(allProducts.map((product) => product.subcategory).filter(Boolean))];

  return (
    <>
    <Navbar />
      {/* Store-specific header banner - Moved from layout.js */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Discover Our Collection
            </h1>
            <p className="text-slate-300 text-lg mb-6">
              Find premium products with top quality and amazing designs.
              Free shipping on orders over 2000 BDT.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Store</h1>
            <p className="text-muted-foreground">
              Browse our collection of {allProducts.length} products
            </p>
          </div>
          
          {/* Search bar */}
          <div className="w-full md:w-auto mt-4 md:mt-0 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar - Desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Products</h3>
                <div className="space-y-1">
                  <Button
                    variant={selectedSubcategory === "" ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedSubcategory("")}
                  >
                    All Products
                  </Button>
                  {uniqueSubcategories.map((subcategory) => (
                    <Button
                      key={subcategory}
                      variant={selectedSubcategory === subcategory ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedSubcategory(subcategory)}
                    >
                      {subcategory}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <PriceRangeSlider
                    value={priceRange}
                    onChange={setPriceRange}
                    showLabel={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile filters button */}
          <div className="lg:hidden w-full mb-4 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile filters panel */}
          {mobileFiltersOpen && (
            <div className="lg:hidden mb-6 p-4 border rounded-lg space-y-4">
              <div>
                <h3 className="font-medium mb-2">Products</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedSubcategory === "" ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => setSelectedSubcategory("")}
                  >
                    All Products
                  </Button>
                  {uniqueSubcategories.map((subcategory) => (
                    <Button
                      key={subcategory}
                      variant={selectedSubcategory === subcategory ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => setSelectedSubcategory(subcategory)}
                    >
                      {subcategory}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="px-2">
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
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} results
              </p>
              
              {/* Desktop sort dropdown */}
              <div className="hidden lg:block">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                    <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={`skeleton-${index}`} className="animate-pulse">
                    <div className="bg-secondary/70 rounded-2xl h-[300px]"></div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.productCode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
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
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubcategory("");
                    setPriceRange([0, 1000]);
                    setSortOption("featured");
                  }}
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