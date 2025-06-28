"use client"

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function ProductImageGallery({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Generate product images for gallery
  const productImages = Array.isArray(product.image) ? product.image : [product.image];

  return (
    <div className="lg:w-1/2 lg:sticky lg:top-36 lg:self-start max-h-screen md:mb-14 lg:mb-0">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-card shadow-sm">
        {productImages.length > 0 ? (
          <Image
            src={productImages[selectedImage] || ''}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized={productImages[selectedImage]?.includes('image1.jpg')}
            onError={(e) => {
              console.error("Image failed to load:", productImages[selectedImage]);
              // Create and replace with placeholder div
              const parent = e.target.parentNode;
              if (parent) {
                // Create replacement div
                const placeholderDiv = document.createElement('div');
                placeholderDiv.className = "w-full h-full bg-secondary/30 flex items-center justify-center";
                placeholderDiv.innerHTML = `<span class="text-muted-foreground">${product.name || 'Product'}</span>`;
                
                // Replace the img with the div
                parent.replaceChild(placeholderDiv, e.target);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
            <span className="text-muted-foreground">{product.name || 'Product'}</span>
          </div>
        )}
        {product.discount > 0 && (
          <div className="absolute top-4 left-4 bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
      </div>
      
      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {productImages.map((image, index) => (
          <button
            key={index}
            className={`relative aspect-square rounded-md overflow-hidden ${
              selectedImage === index ? 'ring-2 ring-primary' : 'ring-1 ring-border'
            }`}
            onClick={() => setSelectedImage(index)}
          >
            {image ? (
              <Image
                src={image}
                alt={`Product view ${index + 1}`}
                fill
                className="object-cover"
                unoptimized={image?.includes('image1.jpg')}
                onError={(e) => {
                  // Create and replace with placeholder div
                  const parent = e.target.parentNode;
                  if (parent) {
                    // Create replacement div
                    const placeholderDiv = document.createElement('div');
                    placeholderDiv.className = "w-full h-full bg-secondary/30 flex items-center justify-center";
                    placeholderDiv.innerHTML = `<span class="text-xs text-muted-foreground">Image ${index+1}</span>`;
                    
                    // Replace the img with the div
                    parent.replaceChild(placeholderDiv, e.target);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Image {index+1}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 