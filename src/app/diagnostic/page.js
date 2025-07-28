"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

export default function DiagnosticPage() {
  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useAuth();
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const checkAuthEndpoint = async (endpoint) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/${endpoint}`, {
        withCredentials: true
      });
      setApiResult({
        endpoint,
        data: response.data,
        status: response.status,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError({
        endpoint,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Diagnostic</CardTitle>
          <CardDescription>Debug session and authentication issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">NextAuth Session</h3>
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="mb-2"><strong>Status:</strong> {status}</div>
                {session ? (
                  <pre className="text-xs overflow-auto max-h-80 p-2 bg-background rounded">
                    {JSON.stringify({
                      user: session.user,
                      expires: session.expires,
                      hasAccessToken: !!session.accessToken
                    }, null, 2)}
                  </pre>
                ) : (
                  <div className="text-muted-foreground">No session found</div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Auth Context</h3>
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="mb-2"><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
                {user ? (
                  <pre className="text-xs overflow-auto max-h-80 p-2 bg-background rounded">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                ) : (
                  <div className="text-muted-foreground">No user found in auth context</div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">API Endpoint Tests</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" onClick={() => checkAuthEndpoint('auth/debug')} disabled={loading}>
                Test Auth Debug
              </Button>
              <Button variant="outline" onClick={() => checkAuthEndpoint('wishlist/check')} disabled={loading}>
                Test Wishlist Check
              </Button>
              <Button variant="outline" onClick={() => checkAuthEndpoint('wishlist')} disabled={loading}>
                Test Wishlist API
              </Button>
            </div>
            
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mr-2"></div>
                <span>Loading...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
                <h4 className="font-medium mb-2">Error testing {error.endpoint}</h4>
                <div className="mb-2"><strong>Status:</strong> {error.status || 'Unknown'}</div>
                <div className="mb-2"><strong>Message:</strong> {error.message}</div>
                {error.response && (
                  <pre className="text-xs overflow-auto max-h-80 p-2 bg-background rounded">
                    {JSON.stringify(error.response, null, 2)}
                  </pre>
                )}
              </div>
            )}
            
            {apiResult && (
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Response from {apiResult.endpoint}</h4>
                <div className="mb-2"><strong>Status:</strong> {apiResult.status}</div>
                <pre className="text-xs overflow-auto max-h-80 p-2 bg-background rounded">
                  {JSON.stringify(apiResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-muted-foreground text-sm">
        This page helps debug authentication issues. 
        Visit this page after logging in to check your session status.
      </div>
    </div>
  );
} 