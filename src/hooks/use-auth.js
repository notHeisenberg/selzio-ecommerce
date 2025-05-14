"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const router = useRouter();
  
  // Check if user is already logged in on initial render
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify token with the server or decode it to get user info
          const userData = JSON.parse(localStorage.getItem('user_data'));
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Save auth data to localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      // Update state
      setUser(data.user);
      
      // Show success message
      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
      });
      
      return data;
    } catch (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Update state
    setUser(null);
    
    // Show logout message
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
    
    // Redirect to home page
    router.push('/');
  };
  
  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      toast({
        title: "Success!",
        description: "Account created successfully. Please log in.",
      });
      
      return data;
    } catch (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 