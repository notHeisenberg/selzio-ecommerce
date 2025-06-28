"use client";

import { motion } from "framer-motion";

export function CategoryFilter({
  categories = [],
  selectedCategory = "all",
  onSelectCategory,
  showAllOption = true,
  allCategoryLabel = "All Products",
  className = "",
  layout = "vertical" // vertical or grid
}) {
  // Animation variants
  const buttonVariants = {
    initial: { 
      borderBottom: "2px solid transparent", 
      y: 0 
    },
    hover: { 
      borderBottom: "2px solid currentColor", 
      y: -2,
      transition: { duration: 0.2 } 
    },
    selected: {
      borderBottom: "2px solid currentColor",
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    }
  };

  const textVariants = {
    initial: { 
      fontWeight: 300,
      scale: 1
    },
    hover: { 
      fontWeight: 400,
      scale: 1.01,
      transition: { duration: 0.2 } 
    },
    selected: {
      fontWeight: 600,
      scale: 1.02,
    }
  };
  
  // Determine layout class based on prop
  const layoutClass = layout === "grid" ? "grid grid-cols-2 sm:grid-cols-3 gap-1" : "space-y-1";

  return (
    <div className={`${layoutClass} ${className}`}>
      {showAllOption && (
        <motion.div
          initial="initial"
          whileHover="hover"
          animate={selectedCategory === "all" ? "selected" : "initial"}
          variants={buttonVariants}
          className="w-full py-2 px-3 cursor-pointer text-sm rounded-none"
          onClick={() => onSelectCategory("all")}
        >
          <motion.span 
            variants={textVariants}
            className="block w-full text-left"
          >
            {allCategoryLabel}
          </motion.span>
        </motion.div>
      )}
      
      {categories.map((category) => (
        <motion.div
          key={category}
          initial="initial"
          whileHover="hover"
          animate={selectedCategory === category ? "selected" : "initial"}
          variants={buttonVariants}
          className="w-full py-2 px-3 cursor-pointer text-sm rounded-none"
          onClick={() => onSelectCategory(category)}
        >
          <motion.span 
            variants={textVariants}
            className="block w-full text-left truncate"
          >
            {category}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
} 