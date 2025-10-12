/**
 * Data Provider - Now uses optimized implementation
 * 
 * This file re-exports the OptimizedDataProvider for backward compatibility.
 * All existing imports from '@/providers/data-provider' will continue to work.
 */

// Re-export everything from the optimized provider
export { OptimizedDataProvider as DataProvider, useAppData } from './optimized-data-provider';

// For direct imports, also export as default
import { OptimizedDataProvider } from './optimized-data-provider';
export default OptimizedDataProvider;
