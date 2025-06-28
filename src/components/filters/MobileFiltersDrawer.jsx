"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { SortBy } from "./SortBy";
import { StockFilter } from "./StockFilter";
import { PriceRangeFilter } from "@/components/ui/price-range-filter";
import { CategoryFilter } from "./CategoryFilter";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from 'react';

export function MobileFiltersDrawer({
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
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="flex items-center justify-between border-b pb-2">
          <DrawerTitle>Filters & Sort</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <ScrollArea className="p-4 h-full max-h-[calc(85vh-10rem)]">
          <div className="flex flex-col gap-6">
            {/* Sort and Filter By in one row */}
            <div>
              <h3 className="text-sm font-medium mb-2">Filter Options</h3>
              <div className="relative flex gap-2 w-full">
                <div className="w-1/2">
                  <StockFilter
                    value={stockFilter}
                    onValueChange={onStockFilterChange}
                    width="w-full"
                    label="Filter by"
                    showIcon={false}
                  />
                </div>
                
                <div className="w-1/2">
                  <SortBy
                    value={sortOption}
                    onValueChange={onSortOptionChange}
                    width="w-full"
                    label="Sort by"
                    showIcon={false}
                  />
                </div>
                
                {/* Single arrow icon for the row */}
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <Separator />

            {/* Price Range filter */}
            <div>
              <h3 className="text-sm font-medium mb-2">Price Range</h3>
              <PriceRangeFilter
                priceRange={priceRange}
                onPriceRangeChange={onPriceRangeChange}
                onResetAllFilters={onResetAllFilters}
                min={minPrice}
                max={maxPrice}
                step={priceStep}
              />
            </div>

            {categories.length > 0 && (
              <>
                <Separator />
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Categories</h3>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={onCategorySelect}
                    showAllOption={true}
                    allCategoryLabel="All Products"
                    className="max-h-60 overflow-y-auto"
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t pt-2">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full rounded-sm text-green-500 border-green-200 hover:bg-green-700 hover:text-white">Apply Filters</Button>
          </DrawerClose>
          <Button variant="outline" className="w-full rounded-sm" onClick={onResetAllFilters}>
            Reset All
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 