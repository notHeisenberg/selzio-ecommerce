"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import { Star, StarHalf, Star as StarEmpty, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Fashion Enthusiast",
    image: "/images/testimonials/sarah.jpg",
    rating: 5,
    text: "The quality of products at Selzio is exceptional. I've been shopping here for months and have never been disappointed. Their customer service is outstanding!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Regular Customer",
    image: "/images/testimonials/michael.jpg",
    rating: 4.3,
    text: "What sets Selzio apart is their attention to detail and commitment to quality. The shipping is fast, and the packaging is always perfect.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Style Blogger",
    image: "/images/testimonials/emma.jpg",
    rating: 3.7,
    text: "As a fashion blogger, I'm always looking for unique pieces. Selzio consistently delivers trendy, high-quality items that my followers love.",
  },
  {
    id: 4,
    name: "David Lee",
    role: "Tech Reviewer",
    image: "/images/testimonials/david.jpg",
    rating: 4.8,
    text: "Selzio's electronics selection is top-notch. Fast shipping and great prices!",
  },
  {
    id: 5,
    name: "Priya Patel",
    role: "Home Decor Lover",
    image: "/images/testimonials/priya.jpg",
    rating: 4.0,
    text: "Beautiful home products and excellent customer support. Highly recommend!",
  },
  {
    id: 6,
    name: "Lucas Smith",
    role: "Gadget Enthusiast",
    image: "/images/testimonials/lucas.jpg",
    rating: 3.5,
    text: "Good variety of gadgets. Some items could be cheaper, but overall a great experience.",
  },
];

function getStarIcons(rating) {
  // Returns an array of 5 elements: 'full', 'half', or 'empty'
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (rating >= i + 1) {
      stars.push('full');
    } else if (rating > i && rating < i + 1) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }
  return stars;
}

export function Testimonials() {
  const { resolvedTheme } = useTheme();
  const [displayRatings, setDisplayRatings] = useState(
    testimonials.map(() => 0)
  );
  const [api, setApi] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const intervalRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [totalPages, setTotalPages] = useState(2); // Default safe value
  const [isMounted, setIsMounted] = useState(false);

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine how many slides should be visible based on screen width
  const getVisibleSlides = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
    }
    return 1;
  }, []);

  // Calculate total pages based on visible slides
  useEffect(() => {
    if (!isMounted) return;
    
    const calculatePages = () => {
      const visibleSlides = getVisibleSlides();
      setTotalPages(Math.ceil(testimonials.length / visibleSlides));
    };
    
    calculatePages();
    
    // Recalculate when window is resized
    window.addEventListener("resize", calculatePages);
    return () => window.removeEventListener("resize", calculatePages);
  }, [isMounted, getVisibleSlides]);

  // Animate rating count for each testimonial
  useEffect(() => {
    if (!isMounted) return;
    
    testimonials.forEach((testimonial, idx) => {
      let currentStep = 0;
      const steps = 20;
      const stepDuration = 1000 / steps;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentRating = Math.min(
          testimonial.rating * progress,
          testimonial.rating
        );
        setDisplayRatings((prev) => {
          const updated = [...prev];
          updated[idx] = Number(currentRating.toFixed(1));
          return updated;
        });
        if (currentStep >= steps) clearInterval(interval);
      }, stepDuration);
      
      return () => clearInterval(interval);
    });
  }, [isMounted]);

  // Simplify navigation - no explicit wrap needed when using duplicated content
  const handleNext = useCallback(() => {
    if (!api || !isMounted) return;
    api.scrollNext();
  }, [api, isMounted]);

  const handlePrev = useCallback(() => {
    if (!api || !isMounted) return;
    api.scrollPrev();
  }, [api, isMounted]);

  // Modify autoplay to use simplified navigation
  useEffect(() => {
    if (!api || isHovered || !isMounted) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [api, isHovered, isMounted, handleNext]);

  // Update current page when api changes selected slide
  useEffect(() => {
    if (!api || !isMounted) return;
    
    const handleSelect = () => {
      const visibleSlides = getVisibleSlides();
      const currentIndex = api.selectedScrollSnap();
      setCurrentPage(Math.floor(currentIndex / visibleSlides));
    };

    api.on("select", handleSelect);
    
    // Set initial page
    handleSelect();
    
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, isMounted, getVisibleSlides]);

  // Scroll to the correct page
  const scrollToPage = useCallback((pageIndex) => {
    if (!api || !isMounted) return;
    const visibleSlides = getVisibleSlides();
    api.scrollTo(pageIndex * visibleSlides);
  }, [api, isMounted, getVisibleSlides]);

  // Don't render carousel on server
  if (!isMounted) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers about their shopping experience.
            </p>
          </div>
          <div className="w-full max-w-6xl mx-auto min-h-[400px] flex items-center justify-center">
            <div className="animate-pulse bg-secondary/50 w-full h-96 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers about their shopping experience.
          </p>
        </div>
        <Carousel
          className="w-full max-w-6xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          setApi={setApi}
          opts={{
            align: "start",
            loop: true, // Enable infinite looping
          }}
        >
          <CarouselContent className="-mx-2">
            {testimonials.map((testimonial, idx) => (
              <CarouselItem
                key={testimonial.id}
                className="basis-full md:basis-1/2 lg:basis-1/3 px-2"
              >
                <div className="p-1 h-full">
                  <div className="h-full relative group">
                    {/* Background gradient effect */}
                    <div className={`absolute inset-0 rounded-2xl opacity-80 transition-opacity duration-500 group-hover:opacity-100
                      ${resolvedTheme === 'dark'
                        ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900/80'
                        : 'bg-gradient-to-br from-white via-white to-violet-50'
                      }`}
                    />
                    
                    {/* Glass morphism card */}
                    <div className={`relative h-full rounded-2xl p-6 overflow-hidden transition-all duration-500 
                      ${resolvedTheme === 'dark'
                        ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/40 group-hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)] group-hover:border-gray-600/50 group-hover:bg-gray-800/90'
                        : 'bg-white/80 backdrop-blur-sm border border-white/40 group-hover:shadow-[0_15px_35px_rgb(124,58,237,0.12)] group-hover:border-violet-100/80 group-hover:bg-white/90'
                      }
                      group-hover:translate-y-[-5px]`}>
                      
                      {/* Decorative elements */}
                      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-xl transition-all duration-700 ease-in-out group-hover:scale-150 group-hover:rotate-45 
                        ${resolvedTheme === 'dark'
                          ? 'bg-gradient-to-br from-blue-500/10 to-blue-400/5 group-hover:from-blue-500/20 group-hover:to-blue-400/10'
                          : 'bg-gradient-to-br from-violet-200/20 to-violet-100/30 group-hover:from-violet-200/30 group-hover:to-violet-100/40'
                        }`}></div>
                      <div className={`absolute -bottom-8 -left-8 w-20 h-20 rounded-full blur-lg transition-all duration-700 ease-in-out group-hover:scale-150
                        ${resolvedTheme === 'dark'
                          ? 'bg-gradient-to-tr from-blue-600/10 to-blue-500/5 group-hover:from-blue-600/20 group-hover:to-blue-500/10'
                          : 'bg-gradient-to-tr from-amber-200/20 to-amber-100/30 group-hover:from-amber-200/30 group-hover:to-amber-100/40'
                        }`}></div>
                      
                      {/* Header with quote and rating */}
                      <div className="flex justify-between items-center mb-4 relative">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 group-hover:rotate-[360deg] group-hover:shadow-md
                          ${resolvedTheme === 'dark'
                            ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600/50 group-hover:border-gray-500/80'
                            : 'bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200/50 group-hover:border-violet-300/80'
                          }`}>
                          <Quote className={`h-5 w-5 group-hover:scale-110 transition-transform duration-500
                            ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-violet-600'}`} /> 
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full shadow-sm transition-all duration-300 group-hover:shadow-md 
                          ${resolvedTheme === 'dark'
                            ? 'bg-gray-700/70 border border-gray-600/50 group-hover:bg-gray-700/90 group-hover:border-gray-500/70'
                            : 'bg-white/70 border border-violet-50 group-hover:bg-white/90 group-hover:border-violet-200/50'
                          }`}>
                          <span className={`text-lg font-bold mr-2 transition-all duration-500 bg-clip-text text-transparent
                            ${resolvedTheme === 'dark'
                              ? 'bg-gradient-to-r from-blue-400 to-blue-300 group-hover:from-blue-300 group-hover:to-blue-200'
                              : 'bg-gradient-to-r from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300'
                            }`}>
                            {displayRatings[idx].toFixed(1)}
                          </span>
                          <div className="flex">
                            {getStarIcons(displayRatings[idx]).map((type, i) =>
                              type === 'full' ? (
                                <Star key={i} className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110
                                  ${resolvedTheme === 'dark'
                                    ? 'fill-blue-400 text-blue-400 group-hover:fill-blue-300'
                                    : 'fill-amber-400 text-amber-400 group-hover:fill-amber-300'
                                  }`} style={{ transitionDelay: `${i * 50}ms` }} />
                              ) : type === 'half' ? (
                                <StarHalf key={i} className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110
                                  ${resolvedTheme === 'dark'
                                    ? 'fill-blue-400 text-blue-400 group-hover:fill-blue-300'
                                    : 'fill-amber-400 text-amber-400 group-hover:fill-amber-300'
                                  }`} style={{ transitionDelay: `${i * 50}ms` }} />
                              ) : (
                                <StarEmpty key={i} className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110
                                  ${resolvedTheme === 'dark'
                                    ? 'text-gray-600 group-hover:text-gray-500'
                                    : 'text-gray-200 group-hover:text-gray-300'
                                  }`} style={{ transitionDelay: `${i * 50}ms` }} />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Testimonial Text */}
                      <p className={`text-base leading-relaxed mb-4 flex-grow relative z-10 transition-colors duration-500
                        ${resolvedTheme === 'dark'
                          ? 'text-gray-300 group-hover:text-gray-200'
                          : 'text-gray-600 group-hover:text-gray-700'
                        }`}>
                        <span className={`absolute -left-4 top-0 text-4xl font-serif transition-colors duration-500
                          ${resolvedTheme === 'dark'
                            ? 'text-blue-500/20 group-hover:text-blue-400/30'
                            : 'text-violet-200/40 group-hover:text-violet-300/50'
                          }`}>"</span>
                        {testimonial.text}
                        <span className={`absolute -bottom-4 right-0 text-4xl font-serif transition-colors duration-500
                          ${resolvedTheme === 'dark'
                            ? 'text-blue-500/20 group-hover:text-blue-400/30'
                            : 'text-violet-200/40 group-hover:text-violet-300/50'
                          }`}>"</span>
                      </p>
                      
                      {/* Customer Info */}
                      <div className={`flex items-center gap-3 mt-auto pt-3 relative transition-colors duration-300 border-t
                        ${resolvedTheme === 'dark'
                          ? 'border-gray-700 group-hover:border-gray-600'
                          : 'border-gray-100 group-hover:border-violet-50'
                        }`}>
                        <div className={`h-10 w-10 rounded-full overflow-hidden bg-gray-200 ring-2 shadow-md transition-all duration-500 group-hover:shadow-lg group-hover:scale-105
                          ${resolvedTheme === 'dark'
                            ? 'ring-gray-700 group-hover:ring-gray-600'
                            : 'ring-white group-hover:ring-violet-100'
                          }`}>
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                        </div>
                        <div className="transform transition-transform duration-300 group-hover:translate-x-1">
                          <h4 className={`font-semibold text-sm transition-colors duration-300
                            ${resolvedTheme === 'dark'
                              ? 'text-gray-200 group-hover:text-blue-300'
                              : 'text-gray-800 group-hover:text-violet-800'
                            }`}>
                            {testimonial.name}
                          </h4>
                          <p className={`text-xs transition-colors duration-300
                            ${resolvedTheme === 'dark'
                              ? 'text-blue-400 group-hover:text-blue-300'
                              : 'text-violet-600 group-hover:text-violet-700'
                            }`}>
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Controls and dots below */}
          <div className="flex flex-col items-center gap-4 mt-10">
            {/* Custom navigation arrows (always enabled) */}
            <div className="flex items-center gap-6">
              <Button
                onClick={handlePrev}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm 
                  hover:scale-110 hover:-translate-x-1
                  ${resolvedTheme === 'dark'
                    ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:shadow-md hover:text-white'
                    : 'bg-white/80 backdrop-blur-sm border border-violet-100 text-violet-600 hover:bg-violet-50 hover:border-violet-200 hover:shadow-md'
                  }`}
                variant="outline"
                size="icon"
              >
                <ChevronLeft className="h-5 w-5 transition-transform duration-300" />
              </Button>
              
              <Button
                onClick={handleNext}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm 
                  hover:scale-110 hover:translate-x-1
                  ${resolvedTheme === 'dark'
                    ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:shadow-md hover:text-white'
                    : 'bg-white/80 backdrop-blur-sm border border-violet-100 text-violet-600 hover:bg-violet-50 hover:border-violet-200 hover:shadow-md'
                  }`}
                variant="outline"
                size="icon"
              >
                <ChevronRight className="h-5 w-5 transition-transform duration-300" />
              </Button>
            </div>
            
            {/* Dots indicator below arrows */}
            <div className="flex gap-3 mt-3">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPage(idx)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300 shadow-sm",
                    currentPage === idx
                      ? resolvedTheme === 'dark'
                        ? "bg-gradient-to-r from-blue-500 to-blue-400 w-10"
                        : "bg-gradient-to-r from-violet-600 to-violet-500 w-10"
                      : resolvedTheme === 'dark'
                        ? "bg-gray-700 border border-gray-600 w-2.5 hover:bg-gray-600"
                        : "bg-white border border-violet-100 w-2.5 hover:bg-violet-50"
                  )}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
} 