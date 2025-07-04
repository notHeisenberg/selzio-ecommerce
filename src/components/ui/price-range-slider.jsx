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
          filler: "bg-primary h-2",
          labelWrapper: "mb-2",
          label: "font-medium text-default-700 text-medium",
          value: "font-medium text-default-500 text-small",
          thumb: [
            "w-5 h-5",
            "bg-primary",
            "border-2 border-background",
            "shadow-sm",
            "data-[dragging=true]:shadow-md data-[dragging=true]:shadow-black/10",
            "data-[dragging=true]:scale-110",
            "transition-all duration-150",
          ],
          step: "data-[in-range=true]:bg-primary/30",
          track: "h-2 rounded-full bg-muted",
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
              "before:bg-primary",
            ],
            content: [
              "py-2 px-3 shadow-md",
              "text-primary-foreground bg-primary",
            ],
          },
        }}
        tooltipValueFormatOptions={{style: "decimal"}}
        aria-label="Price Range Slider"
      />

    </div>
  );
} 