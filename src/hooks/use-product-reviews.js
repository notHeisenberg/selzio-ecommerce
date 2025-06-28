import { useState, useEffect } from 'react';
import axios from 'axios';

export function useProductReviews(productCode) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 5
  });
  const [selectedRating, setSelectedRating] = useState(null);

  // Fetch reviews based on current filters and pagination
  const fetchReviews = async (page = 1, rating = null) => {
    if (!productCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Build the query string
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', pagination.limit);
      if (rating) {
        queryParams.append('rating', rating);
      }
      
      const response = await axios.get(`/api/reviews/${productCode}?${queryParams}`);
      
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
      setRatingDistribution(response.data.ratingDistribution);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (productCode) {
      fetchReviews(1, selectedRating);
    }
  }, [productCode, selectedRating]);

  // Filter by rating
  const filterByRating = (rating) => {
    // Toggle filter if already selected
    if (rating === selectedRating) {
      setSelectedRating(null);
    } else {
      setSelectedRating(rating);
    }
  };

  // Load more reviews
  const loadMoreReviews = () => {
    if (pagination.currentPage < pagination.pages) {
      fetchReviews(pagination.currentPage + 1, selectedRating);
    }
  };

  // Add a new review and refresh the list
  const addReview = async (reviewData) => {
    try {
      // Submit the review using FormData with axios
      const formData = new FormData();
      Object.entries(reviewData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      const response = await axios.post('/api/reviews/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh reviews
      fetchReviews(1, selectedRating);
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error adding review:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to submit review' 
      };
    }
  };

  return {
    reviews,
    loading,
    error,
    ratingDistribution,
    pagination,
    selectedRating,
    filterByRating,
    loadMoreReviews,
    addReview
  };
} 