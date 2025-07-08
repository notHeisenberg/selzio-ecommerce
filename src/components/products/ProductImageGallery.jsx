"use client"

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, X } from 'lucide-react';

export default function ProductImageGallery({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef(null);
  const thumbnailsRef = useRef(null);
  
  // Generate product images for gallery
  const productImages = Array.isArray(product.image) ? product.image : [product.image];

  const handleImageHover = (e) => {
    if (!isHovering && !isZoomed) return;
    
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);
  
  const scrollToThumbnail = (index) => {
    if (thumbnailsRef.current) {
      const thumbnailElement = thumbnailsRef.current.children[index];
      if (thumbnailElement) {
        thumbnailsRef.current.scrollTo({
          left: thumbnailElement.offsetLeft - thumbnailsRef.current.clientWidth / 2 + thumbnailElement.clientWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
    scrollToThumbnail(index);
  };

  return (
    <>
      <div className="lg:w-1/2 lg:sticky lg:top-36 lg:self-start max-h-screen md:mb-14 lg:mb-0" data-gallery-container>
        {/* Main Image */}
        <motion.div 
          className="relative aspect-square w-full overflow-hidden rounded-lg bg-card shadow-sm cursor-zoom-in"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          ref={mainImageRef}
          onMouseMove={handleImageHover}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {productImages.length > 0 ? (
            <>
              <div className="w-full h-full overflow-hidden">
                <Image
                  src={productImages[selectedImage] || ''}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={`object-cover transition-transform duration-200 ${
                    isHovering ? 'scale-150' : 'scale-100'
                  }`}
                  style={
                    isHovering
                      ? {
                          transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                        }
                      : {}
                  }
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
              </div>
              <button 
                className="absolute bottom-4 right-4 bg-black/50 text-white rounded-full p-2 z-10 hover:bg-black/70 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleZoom();
                }}
              >
                {isFullscreen ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
              </button>
            </>
          ) : (
            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
              <span className="text-muted-foreground">{product.name || 'Product'}</span>
            </div>
          )}
          {product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-primary text-white dark:text-black text-sm font-medium px-3 py-1 rounded-full z-10">
              -{product.discount}%
            </div>
          )}
        </motion.div>
        
        {/* Thumbnail Gallery with horizontal scroll - Now with proper spacing */}
        <div className="mt-6 z-20 relative bg-background pb-2">
          <div 
            className="flex gap-3 overflow-x-auto py-2 px-1 scroll-smooth custom-scrollbar"
            ref={thumbnailsRef}
          >
            {productImages.map((image, index) => (
              <motion.button
                key={index}
                className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-primary shadow-md' : 'ring-1 ring-border hover:ring-gray-400'
                } transition-all duration-200`}
                onClick={() => handleThumbnailClick(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`Product view ${index + 1}`}
                    fill
                    sizes="80px"
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
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom scrollbar styling */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c4c4c4;
            border-radius: 10px;
            transition: background 0.3s ease;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a0a0a0;
          }
          
          /* For dark mode */
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f1f1f;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a4a4a;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #5a5a5a;
          }
        `}</style>
      </div>

      {/* Fullscreen view */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button 
            className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors"
            onClick={closeFullscreen}
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full max-w-5xl h-[80vh]">
            <Image
              src={productImages[selectedImage] || ''}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized={productImages[selectedImage]?.includes('image1.jpg')}
            />
          </div>
          
          {/* Fullscreen thumbnails */}
          <div className="absolute bottom-8 left-0 right-0">
            <div className="flex gap-2 justify-center overflow-x-auto pb-2 px-4 custom-scrollbar">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${
                    selectedImage === index ? 'ring-2 ring-white scale-110' : 'ring-1 ring-white/30 opacity-70'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={`Product view ${index + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized={image?.includes('image1.jpg')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-xs text-white/70">Image {index+1}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 