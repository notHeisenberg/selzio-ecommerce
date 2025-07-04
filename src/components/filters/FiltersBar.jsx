"use client";

import { Button } from "@/components/ui/button";
import { SortBy } from "@/components/filters/SortBy";
import { SearchBar } from "@/components/filters/SearchBar";
import { StockFilter } from "@/components/filters/StockFilter";
import { PriceRangeFilter } from "@/components/ui/price-range-filter";
import { MobileFiltersDrawer } from "./MobileFiltersDrawer";

export function FiltersBar({
  searchQuery = "",
  onSearchChange,
  stockFilter = "all",
  onStockFilterChange,
  priceRange = [0, 3000],
  onPriceRangeChange,
  sortOption = "featured",
  onSortOptionChange,
  onResetAllFilters,
  minPrice = 0,
  maxPrice = 3000,
  priceStep = 50,
  categories = [],
  selectedCategory = "all",
  onCategorySelect,
  className = "",
  searchPlaceholder = "Search products..."
}) {
  return (
    <div className={`${className}`}>
      {/* Desktop layout - all in one row */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:justify-between md:gap-4">
        {/* Left Side - Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Stock filter */}
          <StockFilter
            value={stockFilter}
            onValueChange={onStockFilterChange}
            width="min-w-[150px]"
          />
          
          {/* Price Range filter */}
          <PriceRangeFilter
            priceRange={priceRange}
            onPriceRangeChange={onPriceRangeChange}
            onResetAllFilters={onResetAllFilters}
            min={minPrice}
            max={maxPrice}
            step={priceStep}
          />
        </div>
        
        {/* Right Side - Sort and Search */}
        <div className="flex flex-wrap items-center gap-4 ml-auto">
          {/* Sort by */}
          <SortBy
            value={sortOption}
            onValueChange={onSortOptionChange}
            width="min-w-[150px]"
          />
          
          {/* Search bar */}
          <SearchBar
            value={searchQuery}
            onChange={(e) => {
              // Support both direct value and event object
              const newValue = typeof e === 'object' ? e.target.value : e;
              onSearchChange(newValue);
            }}
            placeholder={searchPlaceholder}
            width="min-w-[200px] md:w-[250px]"
          />
        </div>
      </div>

      {/* Mobile layout - search bar and filters drawer */}
      <div className="flex items-center gap-2 md:hidden">
        {/* Mobile filter drawer */}
        <MobileFiltersDrawer
          stockFilter={stockFilter}
          onStockFilterChange={onStockFilterChange}
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
          sortOption={sortOption}
          onSortOptionChange={onSortOptionChange}
          onResetAllFilters={onResetAllFilters}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceStep={priceStep}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
        />
        
        {/* Search bar - always visible */}
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={(e) => {
              // Support both direct value and event object
              const newValue = typeof e === 'object' ? e.target.value : e;
              onSearchChange(newValue);
            }}
            placeholder={searchPlaceholder}
            width="w-full"
          />
        </div>
      </div>
    </div>
  );
} 