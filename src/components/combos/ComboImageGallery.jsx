"use client"

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ComboImageGallery({ combo }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef(null);
  const thumbnailsRef = useRef(null);

  useEffect(() => {
    if (combo) {
      // Use images array if available, fallback to single image, or use placeholder
      if (combo.images && combo.images.length > 0) {
        setImages(combo.images);
      } else if (combo.image) {
        setImages([combo.image]);
      } else {
        setImages(['/images/product-placeholder.jpg']);
      }
      setLoading(false);
    }
  }, [combo]);

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
    scrollToThumbnail(index);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => {
      const newIndex = prev === 0 ? images.length - 1 : prev - 1;
      scrollToThumbnail(newIndex);
      return newIndex;
    });
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => {
      const newIndex = prev === images.length - 1 ? 0 : prev + 1;
      scrollToThumbnail(newIndex);
      return newIndex;
    });
  };

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

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  if (loading || !combo) {
    return (
      <div className="w-full lg:sticky lg:top-24 lg:h-[calc(100vh-12rem)]">
        <div className="aspect-square w-full bg-secondary/50 animate-pulse rounded-lg"></div>
        <div className="flex gap-2 overflow-x-auto mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square w-20 h-20 flex-shrink-0 bg-secondary/50 animate-pulse rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full lg:sticky lg:top-24 lg:h-[calc(100vh-12rem)] flex flex-col">
        {/* Main Image */}
        <motion.div 
          className="relative aspect-square w-full overflow-hidden rounded-lg bg-white dark:bg-gray-800 cursor-zoom-in shadow-sm group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          ref={mainImageRef}
          onMouseMove={handleImageHover}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={toggleZoom}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <div className="w-full h-full overflow-hidden">
                <Image
                  src={images[selectedImage]}
                  alt={`${combo.name} - Image ${selectedImage + 1}`}
                  fill
                  className={`object-cover transition-transform duration-300 ${
                    isHovering ? 'scale-125' : 'scale-100'
                  }`}
                  style={
                    isHovering
                      ? {
                          transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                        }
                      : {}
                  }
                  sizes="(min-width: 1024px) 500px, 100vw"
                  priority
                  onError={(e) => {
                    console.error("Image failed to load:", images[selectedImage]);
                    // Create and replace with placeholder div
                    const parent = e.target.parentNode;
                    if (parent) {
                      // Create replacement div
                      const placeholderDiv = document.createElement('div');
                      placeholderDiv.className = "w-full h-full bg-secondary/30 flex items-center justify-center";
                      placeholderDiv.innerHTML = `<span class="text-muted-foreground">${combo.name || 'Combo'}</span>`;
                      
                      // Replace the img with the div
                      parent.replaceChild(placeholderDiv, e.target);
                    }
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Zoom button */}
          <button 
            className="absolute bottom-4 right-4 bg-black/50 text-white rounded-full p-2 z-10 hover:bg-black/70 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
          >
            {isFullscreen ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent border border-white/30 rounded-md p-2 shadow-sm hover:bg-white/10 dark:hover:bg-gray-800/70 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border border-white/30 rounded-md p-2 shadow-sm hover:bg-white/10 dark:hover:bg-gray-800/70 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Discount badge if applicable */}
          {combo.discount > 0 && (
            <div className="absolute top-4 left-4 z-10">
              <Badge 
                className="rounded-md bg-black/80 text-white border-0 text-sm font-medium px-2.5 py-1.5 shadow-sm"
              >
                {combo.discount}% OFF
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Thumbnails with animation */}
        <div className="mt-6 z-20 relative bg-background pb-2">
          <div 
            className="flex gap-3 overflow-x-auto py-2 px-1 scroll-smooth custom-scrollbar"
            ref={thumbnailsRef}
          >
            {images.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all duration-200 ${
                  selectedImage === index 
                    ? 'ring-2 ring-primary shadow-md scale-105' 
                    : 'ring-1 ring-border hover:ring-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Image
                  src={image}
                  alt={`${combo.name} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
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
        <motion.div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button 
            className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors"
            onClick={closeFullscreen}
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full max-w-5xl h-[80vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
                <Image
                  src={images[selectedImage]}
                  alt={`${combo.name} - Image ${selectedImage + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Fullscreen navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent border border-white/30 rounded-md p-2.5 hover:bg-white/10 transition-all duration-300"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border border-white/30 rounded-md p-2.5 hover:bg-white/10 transition-all duration-300"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          
          {/* Fullscreen thumbnails */}
          <div className="absolute bottom-8 left-0 right-0">
            <div className="flex gap-2 justify-center overflow-x-auto pb-2 px-4 custom-scrollbar">
              {images.map((image, index) => (
                <motion.button
                  key={index}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${
                    selectedImage === index ? 'ring-2 ring-white scale-110' : 'ring-1 ring-white/30 opacity-70'
                  }`}
                  onClick={() => setSelectedImage(index)}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={image}
                    alt={`${combo.name} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
} 