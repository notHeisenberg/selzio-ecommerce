"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StockFilter({
  value,
  onValueChange,
  options = [
    { value: "all", label: "All Products" },
    { value: "in-stock", label: "In Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
  ],
  width = "min-w-[150px]",
  className = "",
  label = "Filter by:",
  showIcon = true
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

  const iconVariants = {
    initial: { rotate: 0 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    focus: { scale: 1.2, transition: { duration: 0.2 } }
  };

  return (
    <div className={`relative ${width} ${className}`}>
      <Select value={value} onValueChange={onValueChange}>
        <motion.div 
          initial="initial"
          whileHover="hover"
          variants={filterComponentVariants}
        >
          <SelectTrigger className="w-full transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="mr-2">{label}</span>
              <SelectValue placeholder="Availability" />
            </div>
            {showIcon && (
              <motion.div variants={iconVariants}>
                <ChevronDown className="h-4 w-4 ml-2" />
              </motion.div>
            )}
          </SelectTrigger>
        </motion.div>
        <SelectContent>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </motion.div>
        </SelectContent>
      </Select>
    </div>
  );
} 