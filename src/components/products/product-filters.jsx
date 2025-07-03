"use client";

import { Search, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceRangeFilter } from "@/components/ui/price-range-filter";

export function ProductFilters({
  searchQuery = "",
  onSearchChange,
  priceRange = [0, 3000],
  onPriceRangeChange,
  stockFilter = "all",
  onStockFilterChange,
  sortOption = "featured",
  onSortOptionChange,
  onResetAllFilters,
  maxPrice = 3000,
  showStockFilter = true,
}) {
  // Animation variants for filter components
  const filterComponentVariants = {
    initial: { 
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      borderColor: "rgba(229, 231, 235, 1)"
    },
    hover: { 
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      borderColor: "rgba(209, 213, 219, 1)",
      transition: { duration: 0.2 }
    },
    focus: {
      boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.2)",
      borderColor: "rgba(99, 102, 241, 0.5)",
      transition: { duration: 0.2 }
    }
  };
  
  const iconVariants = {
    initial: { rotate: 0 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    focus: { scale: 1.2, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {/* Stock filter */}
      {showStockFilter && (
        <div className="relative min-w-[150px]">
          <Select value={stockFilter} onValueChange={onStockFilterChange}>
            <motion.div 
              initial="initial"
              whileHover="hover"
              variants={filterComponentVariants}
            >
              <SelectTrigger className="w-full transition-all duration-200">
                <div className="flex items-center justify-between">
                  <span className="mr-2">Filter by:</span>
                  <SelectValue placeholder="Availability" />
                </div>
                <motion.div variants={iconVariants}>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </motion.div>
              </SelectTrigger>
            </motion.div>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Price Range Filter */}
      <PriceRangeFilter 
        priceRange={priceRange}
        onPriceRangeChange={onPriceRangeChange}
        onResetAllFilters={onResetAllFilters}
        min={0}
        max={maxPrice}
        step={50}
      />
      
      {/* Sort by - on the right with ml-auto */}
      <div className="relative min-w-[150px] ml-auto">
        <Select value={sortOption} onValueChange={onSortOptionChange}>
          <motion.div 
            initial="initial"
            whileHover="hover"
            variants={filterComponentVariants}
          >
            <SelectTrigger className="w-full transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="mr-2">Sort by:</span>
                <SelectValue placeholder="Featured" />
              </div>
              <motion.div variants={iconVariants}>
                <ChevronDown className="h-4 w-4 ml-2" />
              </motion.div>
            </SelectTrigger>
          </motion.div>
          <SelectContent className="min-w-[200px]">
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low-high">Price: Low to High</SelectItem>
              <SelectItem value="price-high-low">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </motion.div>
          </SelectContent>
        </Select>
      </div>
      
      {/* Search bar - the last item */}
      <div className="relative min-w-[200px] md:w-[250px]">
        <motion.div
          initial="initial"
          whileHover="hover"
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <motion.div variants={filterComponentVariants} whileFocus="focus">
            <Input
              placeholder="Search products..."
              className="pl-10 w-full transition-all duration-200"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 