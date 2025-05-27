"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { getProductByCode } from '@/data/products';

export default function DiagnosticPage() {
  const [productCode, setProductCode] = useState('EL-WHPN');
  const [result, setResult] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiResult(null);
      
      console.log(`Attempting to fetch product with code: ${productCode}`);
      
      // Test the function from products.js
      const data = await getProductByCode(productCode);
      console.log('Products.js response:', data);
      
      setResult(data);
      
      // Also test direct API call
      try {
        const apiResponse = await fetch(`/api/products/${productCode}`);
        const apiStatus = apiResponse.status;
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          console.log('Direct API response:', apiData);
          setApiResult({
            status: apiStatus,
            data: apiData
          });
        } else {
          const errorText = await apiResponse.text();
          console.error(`API error (${apiStatus}):`, errorText);
          setApiResult({
            status: apiStatus,
            error: errorText || 'API error without details'
          });
        }
      } catch (apiErr) {
        console.error('Direct API call error:', apiErr);
        setApiResult({
          error: apiErr.message
        });
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Product Diagnostic Tool</h1>
      
      <div className="flex gap-2 mb-6">
        <Input 
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          placeholder="Enter product code"
          className="max-w-xs"
        />
        <Button onClick={testFetch} disabled={loading}>
          {loading ? 'Loading...' : 'Test Fetch'}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {result && (
        <div className="border rounded-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">Result from products.js:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      {apiResult && (
        <div className="border rounded-md p-4">
          <h2 className="text-xl font-semibold mb-2">Direct API Result:</h2>
          <p className="mb-2">Status: {apiResult.status}</p>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            {JSON.stringify(apiResult.data || apiResult.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 