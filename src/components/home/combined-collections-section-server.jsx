"use client"

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ComboCard } from './combo-card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function CombinedCollectionsSectionServer({ featuredCategories = [], combos = [] }) {
  const [imageErrors, setImageErrors] = useState({});

  // Handle image error by setting a flag
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  // If there's no data at all, don't render the section
  if (featuredCategories.length === 0 && combos.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-background overflow-hidden mt-[-20px] sm:mt-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-7">
          <h2 className="text-xl font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            Featured Collections
          </h2>
          <div className="flex flex-wrap gap-3">
            {featuredCategories.length > 0 && (
              <Link href="/store">
                <Button variant="outline" size="sm" className="text-sm rounded-none whitespace-nowrap">
                  View All Collections
                </Button>
              </Link>
            )}
            {combos.length > 0 && (
              <Link href="/combos">
                <Button variant="outline" size="sm" className="text-sm rounded-none whitespace-nowrap">
                  View All Combos
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Collections */}
          {featuredCategories.slice(0, Math.min(2, featuredCategories.length)).map((category, index) => (
            <motion.div
              key={`category-${category.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={category.href} className="block">
                <div className="card-wrapper">
                  <div className="card group">
                    <div className="relative overflow-hidden min-h-[300px] bg-white dark:bg-gray-800">
                      {/* Discount Badge */}
                      {category.discount > 0 && (
                        <div className="absolute top-3 right-3 z-10">
                          <Badge className="bg-red-500 text-white text-xs px-2 py-1 font-semibold shadow-md">
                            Up to {category.discount}% OFF
                          </Badge>
                        </div>
                      )}
                      
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
                            <span className="group-hover:underline transition-all duration-200">
                              {category.name} Collection
                            </span>
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
          ))}
          
          {/* Combos */}
          {combos.slice(0, Math.min(3 - Math.min(2, featuredCategories.length), combos.length)).map((combo, index) => (
            <ComboCard 
              key={`combo-${combo.comboCode}`} 
              combo={combo} 
              index={index + featuredCategories.length} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

