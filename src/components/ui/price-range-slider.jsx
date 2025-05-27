"use client";

import { Slider } from '@heroui/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

export function PriceRangeSlider({ 
  value, 
  onChange, 
  showLabel = true,
  size = "default",
  showSteps = true,
  showTooltip = true 
}) {
  // Local state for input values
  const [minInputValue, setMinInputValue] = useState(value[0].toString());
  const [maxInputValue, setMaxInputValue] = useState(value[1].toString());
  
  // Format price with BDT currency
  const formatPrice = (price) => {
    return `${price.toLocaleString('en-US')} BDT`;
  };
  
  // Default max value is 10000 as specified
  const maxValue = 10000;
  
  // Update input fields when slider value changes
  useEffect(() => {
    setMinInputValue(value[0].toString());
    setMaxInputValue(value[1].toString());
  }, [value]);
  
  // Handle input changes
  const handleInputChange = (type, inputValue) => {
    // Remove non-numeric characters
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    if (type === 'min') {
      setMinInputValue(numericValue);
    } else {
      setMaxInputValue(numericValue);
    }
  };
  
  // Apply input values to slider when user clicks outside or presses Enter
  const handleInputBlur = () => {
    applyInputValues();
  };
  
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyInputValues();
      e.target.blur();
    }
  };
  
  // Apply the values from inputs to the slider
  const applyInputValues = () => {
    const min = parseInt(minInputValue, 10) || 0;
    const max = parseInt(maxInputValue, 10) || maxValue;
    
    // Ensure min is at least 0 and max is at least min
    const validMin = Math.max(0, min);
    const validMax = Math.max(validMin, max);
    
    // Only update if values are different from current slider values
    if (validMin !== value[0] || validMax !== value[1]) {
      onChange([validMin, validMax]);
    }
    
    // Ensure input values reflect validated values
    setMinInputValue(validMin.toString());
    setMaxInputValue(validMax.toString());
  };
  
  return (
    <div className="w-full">
      {showLabel && (
        <label className="text-sm font-medium block mb-2">
          Price Range
        </label>
      )}
      
      <Slider
        classNames={{
          base: "w-full",
          filler: "bg-gradient-to-r from-primary-500 to-secondary-400 h-2",
          labelWrapper: "mb-2",
          label: "font-medium text-default-700 text-medium",
          value: "font-medium text-default-500 text-small",
          thumb: [
            "w-6 h-6",
            "bg-gradient-to-r from-secondary-400 to-primary-500",
            "border-2 border-white",
            "shadow-md",
            "data-[dragging=true]:shadow-lg data-[dragging=true]:shadow-black/20",
            "data-[dragging=true]:scale-110",
            "transition-all duration-150",
          ],
          step: "data-[in-range=true]:bg-black/30 dark:data-[in-range=true]:bg-white/50",
          track: "h-2 rounded-full bg-gray-200 dark:bg-gray-700",
        }}
        value={value}
        onChange={onChange}
        defaultValue={[0, 1000]}
        disableThumbScale={false}
        formatOptions={{style: "decimal"}}
        minValue={0}
        maxValue={maxValue}
        showOutline={true}
        showSteps={showSteps}
        showTooltip={showTooltip}
        size={size}
        step={100}
        tooltipProps={{
          offset: 10,
          placement: "bottom",
          classNames: {
            base: [
              "before:bg-gradient-to-r before:from-secondary-400 before:to-primary-500",
            ],
            content: [
              "py-2 px-3 shadow-xl",
              "text-white bg-gradient-to-r from-secondary-400 to-primary-500",
            ],
          },
        }}
        tooltipValueFormatOptions={{style: "decimal"}}
        aria-label="Price Range Slider"
      />
      
      <div className="flex justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium w-10">Min:</span>
          <div className="relative">
            <Input
              type="text"
              value={minInputValue}
              onChange={(e) => handleInputChange('min', e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-24 text-sm pr-10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
              BDT
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium w-10">Max:</span>
          <div className="relative">
            <Input
              type="text"
              value={maxInputValue}
              onChange={(e) => handleInputChange('max', e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-24 text-sm pr-10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
              BDT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 