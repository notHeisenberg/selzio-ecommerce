"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Star, Upload, X, Loader2, ChevronRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { format } from 'date-fns';
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProductReviews } from '@/hooks/use-product-reviews';
import Image from "next/image";

export default function ProductReviews({ product, toast }) {
  // Review form state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Review pagination state - custom pagination for "load more" behavior
  const [visibleReviews, setVisibleReviews] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(5); // Start with 5 reviews
  const [loadMoreAmount, setLoadMoreAmount] = useState(10); // Load 10 more next time
  
  // Local filtering state
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [filteredReviews, setFilteredReviews] = useState([]);
  
  // Image preview dialog
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // Form data state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Use the product reviews hook - only for initial data fetching
  const {
    reviews: fetchedReviews,
    loading: initialLoading,
    error,
    ratingDistribution,
    addReview
  } = useProductReviews(product.productCode);

  // Keep a local copy of all reviews to filter client-side
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Store a reference to the original rating distribution that won't change when filtering
  const [originalRatingDistribution, setOriginalRatingDistribution] = useState([]);

  // Initialize all reviews and distribution when data is fetched
  useEffect(() => {
    if (fetchedReviews && fetchedReviews.length > 0) {
      setAllReviews(fetchedReviews);
      setFilteredReviews(fetchedReviews);
      setLoading(false);
    } else if (!initialLoading) {
      setAllReviews([]);
      setFilteredReviews([]);
      setLoading(false);
    }
    
    // Store the original rating distribution
    if (ratingDistribution && ratingDistribution.length > 0) {
      setOriginalRatingDistribution(ratingDistribution);
    }
  }, [fetchedReviews, initialLoading, ratingDistribution]);

  // Client-side filtering function
  const filterReviews = useCallback((selectedRating) => {
    setSelectedRatingFilter(selectedRating);
    
    // Reset pagination when changing filters
    setDisplayLimit(5);
    
    if (selectedRating === null) {
      setFilteredReviews(allReviews);
    } else {
      const filtered = allReviews.filter(review => review.rating === selectedRating);
      setFilteredReviews(filtered);
    }
  }, [allReviews]);

  // Update visible reviews whenever the filtered reviews array or display limit changes
  useEffect(() => {
    if (filteredReviews && filteredReviews.length > 0) {
      setVisibleReviews(filteredReviews.slice(0, Math.min(displayLimit, filteredReviews.length)));
    } else {
      setVisibleReviews([]);
    }
  }, [filteredReviews, displayLimit]);
  
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
  
  // Handle image preview
  const openImagePreview = (url) => {
    setImagePreviewUrl(url);
    setPreviewDialogOpen(true);
  };
  
  // Load more reviews function - implements the requested pagination pattern
  const handleLoadMore = () => {
    if (filteredReviews.length > displayLimit) {
      const remaining = filteredReviews.length - displayLimit;
      
      if (displayLimit === 5) {
        // First load more: Get 10 more
        setDisplayLimit(displayLimit + Math.min(loadMoreAmount, remaining));
      } else {
        // Second load more: Get all remaining
        setDisplayLimit(filteredReviews.length);
      }
    }
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
      // Prepare review data
      const reviewData = {
        productId: product._id,
        productCode: product.productCode,
        name,
        email,
        reviewText,
        rating,
        image: imageFile
      };
      
      // Submit the review using the hook
      const result = await addReview(reviewData);
      
      if (result.success) {
        // Add the new review to our local state to avoid reloading
        const newReview = {
          ...reviewData,
          _id: Date.now(), // Temporary ID
          date: new Date(),
          verified: false,
        };
        
        // Update all collections
        setAllReviews(prev => [newReview, ...prev]);
        
        // Update filtered collection if relevant
        if (!selectedRatingFilter || selectedRatingFilter === rating) {
          setFilteredReviews(prev => [newReview, ...prev]);
        }
        
        toast({
          title: "Review Submitted",
          description: "Thank you for your review!",
        });
        handleReviewDialogClose();
      } else {
        setSubmitError(result.error);
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Review Summary */}
        <div className="lg:col-span-4 bg-secondary/10 p-6 rounded-none">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold mb-2">{product.rating || 0}</div>
            <div className="flex justify-center mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Based on {product.reviews || 0} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {originalRatingDistribution.map(({ rating, count, percentage }) => (
              <motion.button
                key={rating}
                onClick={() => filterReviews(rating)}
                className={`flex items-center gap-2 w-full transition-all hover:bg-secondary/20 p-1 ${
                  selectedRatingFilter === rating ? 'bg-secondary/30' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "tween", stiffness: 200, damping: 10 }}
                aria-pressed={selectedRatingFilter === rating}
                title={`Filter by ${rating} star reviews`}
              >
                <div className="text-sm font-medium w-3">{rating}</div>
                <motion.div
                  className="flex items-center"
                >
                  <Star className={`h-4 w-4 ${selectedRatingFilter === rating ? 'fill-amber-500 text-amber-500' : 'fill-amber-400 text-amber-400'}`} />
                </motion.div>
                <div className="w-full bg-secondary/30 h-2">
                  <motion.div
                    className={`${selectedRatingFilter === rating ? 'bg-amber-500' : 'bg-amber-400'} h-2 transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {percentage}% ({count})
                </div>
              </motion.button>
            ))}
            <div className="flex sm:flex-row sm:items-center justify-center mb-6 gap-4 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className=" w-auto rounded-none border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white uppercase tracking-wider font-bold"
                onClick={handleReviewDialogOpen}
              >
                Write a Review
              </Button>
            </div>

            {/* Review Dialog with Form */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogContent className="sm:max-w-[500px] max-h-[85vh] rounded-none border-2 border-black dark:border-white">
                <DialogHeader className="border-b-2 border-black dark:border-white pb-3">
                  <DialogTitle className="text-lg uppercase tracking-wider font-bold">Review {product.name}</DialogTitle>
                </DialogHeader>
                
                <AnimatePresence mode="wait">
                  <motion.form 
                    onSubmit={handleSubmitReview} 
                    className="space-y-5 mt-5 overflow-y-auto pr-1" 
                    style={{ maxHeight: "calc(85vh - 100px)" }}
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
                      className="border-l-4 border-transparent"
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
                      <Label htmlFor="review" className="text-sm font-bold uppercase tracking-wide">Your Review*</Label>
                      <Textarea 
                        id="review"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="What did you like or dislike about this product?"
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
                              alt="Review"
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
                    
                    {/* Submit Button */}
                    <motion.div 
                      className="flex justify-end gap-3 pt-2 border-t-2 border-gray-200 dark:border-gray-700 mt-6"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
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
                        type="submit"
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
                          'Submit Review'
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                </AnimatePresence>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Review List */}
        <div className="lg:col-span-8">
          {initialLoading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading reviews...</p>
            </div>
          ) : (
            <>
              {/* Filter indicator */}
              {selectedRatingFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-2 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 flex justify-between items-center rounded-none"
                >
                  <div className="flex items-center">
                    <span className="mr-2">Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'} with</span> 
                    <div className="flex items-center">
                      <span className="font-bold mr-1">{selectedRatingFilter}</span>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-2 text-sm hover:bg-amber-100"
                    onClick={() => filterReviews(null)}
                  >
                    Clear filter
                  </Button>
                </motion.div>
              )}
            
              {/* Review Items */}
              <AnimatePresence mode="wait">
                {visibleReviews.length > 0 ? (
                  <motion.div
                    key="reviews-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Actual reviews list */}
                    <AnimatePresence initial={false}>
                      {visibleReviews.map((review, index) => (
                        <motion.div 
                          key={review._id || index}
                          className="group border-2 border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors rounded-none"
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
                          exit={{ opacity: 0, height: 0 }}
                          whileHover={{
                            y: -3,
                            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                            transition: { duration: 0.2 }
                          }}
                        >
                          {/* Review header with user info */}
                          <div className="p-5 bg-white dark:bg-gray-900 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center">
                                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                                  <Avatar className="h-10 w-10 mr-3 rounded-none border-2 border-black dark:border-white">
                                    <div className="bg-black dark:bg-white flex items-center justify-center h-full w-full text-white dark:text-black font-medium">
                                      {review.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                  </Avatar>
                                </motion.div>
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="font-bold text-black dark:text-white">{review.name}</h4>
                                    {review.verified && (
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
                                            className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                                          />
                                        </motion.div>
                                      ))}
                                    </motion.div>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {review.date && format(new Date(review.date), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Review content */}
                            <div className="mb-4 mt-1 pl-0 transition-all group-hover:pl-2 duration-300">
                              <p className="text-muted-foreground">{review.text}</p>
                            </div>
                            
                            {/* Review image if provided */}
                            {review.image && (
                              <div className="mt-3 mb-4">
                                <motion.div 
                                  className="relative overflow-hidden cursor-pointer inline-block border-2 border-black dark:border-white rounded-none"
                                  whileHover={{ scale: 1.03 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                  onClick={() => openImagePreview(review.image)}
                                >
                                  <div className="relative h-32 w-32">
                                    <Image 
                                      src={review.image}
                                      alt={`Review by ${review.name}`}
                                      fill
                                      sizes="(max-width: 768px) 100px, 128px"
                                      className="object-cover"
                                      quality={85}
                                      priority={index < 2} // Load first two images with priority
                                    />
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
                                      <Camera className="text-white w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Load More Button */}
                    {filteredReviews.length > visibleReviews.length && (
                      <motion.div 
                        className="mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button 
                          onClick={handleLoadMore}
                          variant="outline"
                          className="w-full py-6 rounded-none border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all font-bold tracking-wider uppercase flex items-center justify-center gap-2 group"
                        >
                          {displayLimit === 5 ? 
                            `Load ${Math.min(loadMoreAmount, filteredReviews.length - displayLimit)} More Reviews` : 
                            `Show All (${filteredReviews.length - displayLimit} More)`
                          }
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          >
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    key="error-reviews"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-none"
                  >
                    <p className="text-red-600 dark:text-red-400">Error loading reviews: {error}</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-reviews"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-none"
                  >
                    <p className="text-lg font-medium text-black dark:text-white mb-2">
                      {selectedRatingFilter 
                        ? `No ${selectedRatingFilter}-star reviews yet` 
                        : 'No reviews yet'}
                    </p>
                    <p className="text-muted-foreground mb-6">
                      {selectedRatingFilter 
                        ? 'Be the first to leave a review with this rating!' 
                        : 'Be the first to review this product!'}
                    </p>
                    <Button 
                      variant="outline"
                      onClick={handleReviewDialogOpen}
                      className="rounded-none border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white uppercase tracking-wider font-bold"
                    >
                      Write a Review
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
      
      {/* Image Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 border-0 bg-transparent shadow-none rounded-none" closeButton={false}>
          <div className="relative h-[70vh] bg-black/90 p-1 rounded-none">
            {imagePreviewUrl && (
              <Image
                src={imagePreviewUrl}
                alt="Review image preview"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-contain"
                quality={100}
                priority
              />
            )}
            <Button
              className="absolute top-4 right-4 rounded-none border-2 border-white dark:border-gray-300 text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-black/40 z-50"
              size="icon"
              variant="ghost"
              onClick={() => setPreviewDialogOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
} 