"use client"

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function ComboCard({ combo, index }) {
  const [imageError, setImageError] = useState(false);

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  if (!combo) return null;

  // Get image to display - prefer dedicated image field, then first image from array, then fallback
  const displayImage = combo.image || (combo.images && combo.images.length > 0 ? combo.images[0] : '/images/product-placeholder.jpg');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link href={`/combos/${combo.comboCode}`} className="block">
        <div className="card-wrapper">
          <div className="card group">
            <div className="relative overflow-hidden min-h-[300px] bg-white dark:bg-gray-800 border border-border rounded-none">
              {/* Card Media with stable dimensions */}
              <div className="card__media h-[300px] w-full relative">
                {imageError ? (
                  // Placeholder when image fails to load
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-none">
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                      {combo.name}
                    </span>
                  </div>
                ) : (
                  <div className="h-full w-full overflow-hidden rounded-none">
                    {/* Static container with hover effect applied to child */}
                    <div className="h-full w-full relative transform transition-transform duration-300 group-hover:scale-105">
                      <Image 
                        src={displayImage}
                        alt={combo.name}
                        fill
                        priority={index < 3}
                        className="object-cover"
                        sizes="(min-width: 1200px) 366px, (min-width: 750px) calc((100vw - 10rem) / 2), calc(100vw - 3rem)"
                        onError={handleImageError}
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
                    <span className="group-hover:underline transition-all duration-200">{combo.name}</span>
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
  );
} 