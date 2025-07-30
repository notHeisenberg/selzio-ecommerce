"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, User, Loader2, X, Upload } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import Image from "next/image";

// More realistic testimonials with verified purchase status
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Verified Buyer",
    verified: true,
    date: "2023-11-15",
    image: null,
    rating: 5,
    text: "I ordered the minimalist watch and I'm absolutely in love with it. The quality is exceptional and it looks even better in person than in the photos. Shipping was fast and the packaging was very secure. Definitely coming back for more!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Verified Buyer",
    verified: true,
    date: "2023-12-03",
    image: null,
    rating: 4,
    text: "The leather jacket I purchased exceeded my expectations in terms of quality. The fit is perfect and the material feels premium. My only small complaint is that the shipping took a bit longer than expected, but the product was worth the wait.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Fashion Blogger",
    verified: true,
    date: "2024-01-20",
    image: null,
    rating: 5,
    text: "As someone who reviews fashion items professionally, I can say that Selzio's collection stands out from the crowd. The attention to detail and quality control is evident in every piece I've purchased. My followers have been asking where I got these items!",
  },
  {
    id: 4,
    name: "David Lee",
    role: "Verified Buyer",
    verified: true,
    date: "2024-02-05",
    image: null,
    rating: 4,
    text: "The wireless earbuds I purchased have great sound quality and battery life. Customer service was also very helpful when I had questions about the features. Would definitely recommend to friends looking for good tech products.",
  },
  {
    id: 5,
    name: "Priya Patel",
    role: "Interior Designer",
    verified: true,
    date: "2024-03-12",
    image: null,
    rating: 5,
    text: "I've ordered several home decor items for my clients and myself. The quality is consistent and the designs are unique. What I appreciate most is how accurately the products match their online descriptions and images.",
  },
  {
    id: 6,
    name: "Lucas Smith",
    role: "Verified Buyer",
    verified: false,
    date: "2024-04-08",
    image: null,
    rating: 4,
    text: "The smart watch has been a great addition to my tech collection. Good functionality and battery life. The app is intuitive and setup was easy. The only reason I'm not giving 5 stars is because the band could be more comfortable for all-day wear.",
  },
];

export function Testimonials() {
  const { resolvedTheme } = useTheme();
  const [api, setApi] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const intervalRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [totalPages, setTotalPages] = useState(2); // Default safe value
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  // Review form state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Form data state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [localTestimonials, setLocalTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get('/api/testimonials?limit=12');
        if (response.data && response.data.testimonials) {
          setLocalTestimonials(response.data.testimonials);
        } else {
          setError('Could not fetch testimonials.');
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTestimonials();
  }, []);

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
      setTotalPages(Math.ceil(localTestimonials.length / visibleSlides));
    };
    
    calculatePages();
    
    // Recalculate when window is resized
    window.addEventListener("resize", calculatePages);
    return () => window.removeEventListener("resize", calculatePages);
  }, [isMounted, getVisibleSlides, localTestimonials]);

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

  const handleReviewDialogOpen = () => {
    setReviewDialogOpen(true);
  };

  const handleReviewDialogClose = () => {
    setReviewDialogOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setReviewText('');
    setRating(0);
    setImageFile(null);
    setImagePreview(null);
    setSubmitError('');
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSubmitError('Image size should be less than 2MB');
        return;
      }
      
      setImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name || !reviewText || rating === 0) {
      setSubmitError('Please fill in all required fields and provide a rating.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Create new testimonial
      const newTestimonial = {
        id: Date.now(),
        name,
        role: "Customer",
        verified: false,
        date: new Date().toISOString().split('T')[0],
        image: imagePreview, // Use the image preview for display
        rating,
        text: reviewText,
      };
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to local testimonials
      setLocalTestimonials(prev => [newTestimonial, ...prev]);
      
      toast({
        title: "Testimonial Submitted",
        description: "Thank you for sharing your experience!",
      });
      
      handleReviewDialogClose();
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
      console.error('Error submitting testimonial:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render carousel on server
  if (!isMounted) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers about their shopping experience.
            </p>
          </div>
          <div className="w-full max-w-6xl mx-auto min-h-[400px] flex items-center justify-center">
            {isLoading ? (
              <div className="animate-pulse bg-secondary/50 w-full h-96 rounded-lg" />
            ) : error ? (
              <div className="text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
                <p>Could not load testimonials. Please try again later.</p>
              </div>
            ) : (
              <div className="animate-pulse bg-secondary/50 w-full h-96 rounded-lg" />
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Don't just take our word for it - hear from our satisfied customers about their shopping experience.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white uppercase tracking-wider font-bold"
            onClick={handleReviewDialogOpen}
          >
            Share Your Experience
          </Button>
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
            {localTestimonials.map((testimonial, index) => (
              <CarouselItem
                key={testimonial.id}
                className="basis-full md:basis-1/2 lg:basis-1/3 px-2"
              >
                <motion.div 
                  className="group border-2 border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors rounded-none h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: index * 0.05, 
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }
                  }}
                  whileHover={{
                    y: -3,
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Review header with user info */}
                  <div className="p-5 bg-white dark:bg-gray-900 transition-colors h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                          <Avatar className="h-10 w-10 mr-3 rounded-none border-2 border-black dark:border-white">
                            <div className="bg-black dark:bg-white flex items-center justify-center h-full w-full text-white dark:text-black font-medium">
                              {testimonial.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          </Avatar>
                        </motion.div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-bold text-black dark:text-white">{testimonial.name}</h4>
                            {testimonial.verified && (
                              <Badge variant="outline" className="ml-2 border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 uppercase text-xs rounded-none">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex mt-0.5">
                            <motion.div 
                              className="flex"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 + 0.1, staggerChildren: 0.05 }}
                            >
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                >
                                  <Star
                                    className={`h-3.5 w-3.5 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                            <span className="text-xs text-muted-foreground ml-2">
                              {testimonial.date && format(new Date(testimonial.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Review content */}
                    <div className="mb-4 mt-1 pl-0 transition-all group-hover:pl-2 duration-300 flex-grow">
                      <p className="text-muted-foreground">{testimonial.text}</p>
                    </div>
                    
                    {/* Review image if provided */}
                    {testimonial.image && (
                      <div className="my-4 flex justify-center sm:justify-start">
                        <Image
                          src={testimonial.image}
                          alt={`Review by ${testimonial.name}`}
                          width={80}
                          height={80}
                          className="rounded-md object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    )}
                    
                    {/* Review role */}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{testimonial.role}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Controls and dots below */}
          <div className="flex flex-col items-center gap-4 mt-10">
            {/* Custom navigation arrows (always enabled) */}
            <div className="flex items-center gap-6">
              <Button
                onClick={handlePrev}
                className="rounded-none border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                variant="outline"
                size="icon"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleNext}
                className="rounded-none border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                variant="outline"
                size="icon"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Dots indicator below arrows */}
            <div className="flex gap-3 mt-3">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPage(idx)}
                  className={cn(
                    "h-2.5 rounded-none transition-all duration-300",
                    currentPage === idx
                      ? "bg-black dark:bg-white w-10"
                      : "bg-gray-200 dark:bg-gray-700 w-2.5 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </Carousel>
      </div>

      {/* Review Dialog with Form */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] rounded-none border-2 border-black dark:border-white p-0">
          <DialogHeader className="border-b-2 border-black dark:border-white pb-3 px-6 pt-6">
            <DialogTitle className="text-lg uppercase tracking-wider font-bold">Share Your Experience</DialogTitle>
          </DialogHeader>
          
          {/* Scrollable Content */}
          <motion.div 
            className="space-y-5 mt-5 overflow-y-auto px-6 py-4" 
            style={{ maxHeight: "calc(85vh - 160px)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
              {/* Rating Selection */}
              <div className="border-l-4 border-black dark:border-white pl-3 py-1">
                <Label htmlFor="rating" className="text-sm font-bold uppercase tracking-wide">Rating*</Label>
                <motion.div 
                  className="flex items-center gap-1 mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="focus:outline-none"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ scale: 0.9 }}
                      animate={{ 
                        scale: value <= rating ? 1.1 : 1,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <Star
                        className={`h-7 w-7 transition-all ${
                          value <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                        }`}
                      />
                    </motion.button>
                  ))}
                  <motion.span 
                    className="ml-2 text-amber-500 dark:text-amber-400 text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: rating > 0 ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </motion.span>
                </motion.div>
              </div>
              
              {/* Name */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-l-4 border-black dark:border-white pl-3 py-1"
              >
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wide">Your Name*</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-2 rounded-none border-2 border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-0 transition-colors"
                  required
                />
              </motion.div>
              
              {/* Email (Optional) */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border-l-4 border-transparent"
              >
                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wide">Your Email (Optional)</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-2 rounded-none border-2 border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-0 transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your email will not be published.
                </p>
              </motion.div>
              
              {/* Review Text */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-l-4 border-black dark:border-white pl-3 py-1"
              >
                <Label htmlFor="review" className="text-sm font-bold uppercase tracking-wide">Your Experience*</Label>
                <Textarea 
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with our products or services..."
                  rows={4}
                  className="mt-2 rounded-none border-2 border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-0 transition-colors resize-none"
                  required
                />
              </motion.div>
              
              {/* Image Upload */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="border-l-4 border-transparent"
              >
                <Label htmlFor="image" className="text-sm font-bold uppercase tracking-wide">Add a Photo (Optional)</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <motion.div 
                      className="relative w-24 h-24 border-2 border-black dark:border-white overflow-hidden"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <img
                        src={imagePreview}
                        alt="Testimonial"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-black text-white dark:bg-white dark:text-black p-1 border-none"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white p-4"
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.025)" }}
                    >
                      <label className="flex flex-col items-center cursor-pointer">
                        <Upload className="h-5 w-5 text-gray-500 mb-1.5" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: 2MB
                </p>
              </motion.div>
              
              {/* Error Message */}
              {submitError && (
                <motion.div 
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-l-4 border-red-500 dark:border-red-400 p-3 text-sm"
                  initial={{ opacity: 0, scaleY: 0, originY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {submitError}
                </motion.div>
              )}
            </motion.div>
          
            {/* Fixed Button Footer */}
            <motion.div 
              className="flex justify-end gap-3 pt-12 px-1 bg-transparent"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReviewDialogClose}
                className="rounded-none border-2 border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white hover:bg-transparent"
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleSubmitReview}
                size="sm"
                disabled={isSubmitting}
                className="rounded-none bg-black hover:bg-black/80 text-white dark:bg-white dark:text-black dark:hover:bg-white/80 uppercase tracking-wider border-2 border-black dark:border-white font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </motion.div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
