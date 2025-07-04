"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceRangeSlider } from "@/components/ui/price-range-slider";
import { Settings, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PriceRangeFilter({ 
  priceRange, 
  onPriceRangeChange, 
  onResetAllFilters,
  min = 0,
  max = 3000,
  step = 50,
  currency = "৳"
}) {
  const [minPriceInput, setMinPriceInput] = useState(priceRange[0].toString());
  const [maxPriceInput, setMaxPriceInput] = useState(priceRange[1].toString());
  const [openPopover, setOpenPopover] = useState(false);
  
  // Handle manual price range apply
  const handleApplyPriceRange = () => {
    const minValue = parseInt(minPriceInput);
    const maxValue = parseInt(maxPriceInput);
    
    if (!isNaN(minValue) && !isNaN(maxValue) && minValue >= min && maxValue > minValue && maxValue <= max) {
      onPriceRangeChange([minValue, maxValue]);
      setOpenPopover(false);
    }
  };
  
  // Update input fields when priceRange changes externally
  if (priceRange[0].toString() !== minPriceInput) {
    setMinPriceInput(priceRange[0].toString());
  }
  
  if (priceRange[1].toString() !== maxPriceInput) {
    setMaxPriceInput(priceRange[1].toString());
  }
  
  return (
    <div className="flex items-center gap-2 min-w-[350px] flex-grow md:flex-grow-0 md:max-w-[450px]">
      <div className="text-sm whitespace-nowrap mr-1">Price:</div>
      
      <div className="flex-grow relative">
        <div className="absolute top-[-20px] right-1 text-xs whitespace-nowrap text-muted-foreground">
          {currency}{priceRange[0]} - {currency}{priceRange[1]}
        </div>
        <PriceRangeSlider
          value={priceRange}
          onChange={onPriceRangeChange}
          min={min}
          max={max}
          step={step}
          showLabel={false}
          className="px-1 py-3 h-12"
        />
      </div>
      
      {/* Buttons column */}
      <div className="flex flex-col gap-1">
        {/* Set Range Button with Popover */}
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 w-6 px-4 flex items-center justify-center gap-1 text-xs rounded-none"
              >
                <Settings className="h-3 w-6" />
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-3 rounded-none">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Set Price Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="min-price" className="text-xs">Min</label>
                  <Input
                    id="min-price"
                    size="sm"
                    type="number"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="h-8 rounded-none"
                  />
                </div>
                <div>
                  <label htmlFor="max-price" className="text-xs">Max</label>
                  <Input
                    id="max-price"
                    size="sm"
                    type="number"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="h-8 rounded-none"
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleApplyPriceRange} 
                className="w-full h-8 rounded-none"
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Reset Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetAllFilters}
            className="h-6 px-2 flex items-center gap-1 text-xs rounded-none"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <span>Reset</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 