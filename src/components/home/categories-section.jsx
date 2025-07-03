"use client"

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getFeaturedCategories } from '@/data/products';
import { useState, useEffect } from 'react';

export function CategoriesSection() {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  // Handle image error by setting a flag
  const handleImageError = (categoryId) => {
    setImageErrors(prev => ({
      ...prev,
      [categoryId]: true
    }));
  };

  // Fetch featured subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subcategories = await getFeaturedCategories();
        setFeaturedCategories(subcategories);
      } catch (error) {
        console.error('Failed to fetch featured subcategories:', error);
        setFeaturedCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubcategories();
  }, []);

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-start">
          <h2 className="text-xl font-medium mb-7 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse">
                <div className="rounded-md h-80 bg-secondary/70"></div>
              </div>
            ))
          ) : (
            // Actual categories
            featuredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={category.href} className="block">
                  <div className="card-wrapper">
                    <div className="card group">
                      <div className="relative overflow-hidden min-h-[300px] bg-white dark:bg-gray-800">
                        {/* Card Media with stable dimensions */}
                        <div className="card__media h-[300px] w-full relative">
                          {imageErrors[category.id] ? (
                            // Placeholder when image fails to load
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                {category.name}
                              </span>
                            </div>
                          ) : (
                            <div className="h-full w-full overflow-hidden">
                              {/* Static container with hover effect applied to child */}
                              <div className="h-full w-full relative transform transition-transform duration-300 group-hover:scale-105">
                                <Image 
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  priority={index < 3}
                                  className="object-cover"
                                  sizes="(min-width: 1200px) 366px, (min-width: 750px) calc((100vw - 10rem) / 2), calc(100vw - 3rem)"
                                  onError={() => handleImageError(category.id)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                        
                      {/* Card Content */}
                      <div className="card__content mt-4 text-gray-800 dark:text-white">
                        <div className="card__information">
                          <h3 className="card__heading">
                            <span className="flex items-center group">
                              <span className="group-hover:underline transition-all duration-200">{category.name}</span>
                              <span className="ml-2">
                                <svg viewBox="0 0 14 10" fill="none" aria-hidden="true" focusable="false" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1">
                                  <path 
                                    fillRule="evenodd" 
                                    clipRule="evenodd" 
                                    d="M8.537.808a.5.5 0 01.817-.162l4 4a.5.5 0 010 .708l-4 4a.5.5 0 11-.708-.708L11.793 5.5H1a.5.5 0 010-1h10.793L8.646 1.354a.5.5 0 01-.109-.546z" 
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </span>
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
} 