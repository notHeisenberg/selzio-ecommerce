import { Skeleton } from "@/components/ui/skeleton";

export default function StoreLoading() {
  // Create an array of 9 items for skeleton loading
  const skeletonProducts = Array.from({ length: 9 }, (_, i) => i);

  return (
    <>
      {/* Store-specific header banner skeleton */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-xl">
            <Skeleton className="h-10 w-80 mb-3" />
            <Skeleton className="h-6 w-full max-w-md mb-1" />
            <Skeleton className="h-6 w-full max-w-sm mb-6" />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <Skeleton className="h-10 w-40 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Skeleton className="h-10 w-full md:w-[300px]" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar skeleton */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-24 mb-3" />
                <Skeleton className="h-4 w-full mt-8 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile filters button skeleton */}
          <div className="lg:hidden w-full mb-4 flex justify-between items-center">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-[180px]" />
          </div>

          {/* Products Grid skeleton */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-5 w-40" />
              <div className="hidden lg:block">
                <Skeleton className="h-9 w-[180px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {skeletonProducts.map((index) => (
                <div key={index} className="relative rounded-2xl overflow-hidden">
                  {/* Product Card Skeleton */}
                  <div className="h-full space-y-2">
                    <Skeleton className="aspect-square w-full rounded-t-2xl" />
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-7 w-1/4" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 