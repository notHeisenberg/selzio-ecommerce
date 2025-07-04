"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "",
  width = "min-w-[200px] md:w-[250px]" 
}) {
  // Animation variants
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
  
  // Direct change handler to simplify event handling
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      // Make sure we're passing a proper event object with target.value
      if (e && e.target) {
        onChange(e);
      } else {
        // Create a synthetic event if the event object is missing
        onChange({ target: { value: e } });
      }
    }
  };

  return (
    <div className={`relative ${width} ${className}`}>
      <motion.div
        initial="initial"
        whileHover="hover"
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
        <motion.div variants={filterComponentVariants} whileFocus="focus">
          <Input
            placeholder={placeholder}
            className="pl-10 w-full transition-all duration-200 rounded-none"
            value={value}
            onChange={handleChange}
            type="search"
          />
        </motion.div>
      </motion.div>
    </div>
  );
} 