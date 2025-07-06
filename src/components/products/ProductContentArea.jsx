"use client"

import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Only import ProductReviews as a separate component
import ProductReviews from './sections/ProductReviews';

// CSS for hiding scrollbars
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default function ProductContentArea({
    product,
    quantity,
    handleQuantityChange,
    handleAddToCart,
    handleBuyNow,
    isInWishlist,
    handleWishlistToggle,
    formatPrice,
    getDiscountedPrice
}) {
    const { toast } = useToast();
    const [selectedSize, setSelectedSize] = useState('');
    const [currentPrice, setCurrentPrice] = useState(product.price);

    // Initialize the first size as default when component mounts
    useEffect(() => {
        if (product.sizes && product.sizes.length > 0) {
            setSelectedSize(product.sizes[0].name);
            setCurrentPrice(product.sizes[0].price || product.price);
        }
    }, [product]);

    // Update price when size changes
    const handleSizeChange = (size) => {
        setSelectedSize(size.name);
        setCurrentPrice(size.price || product.price);
    };

    // Add to cart with selected size
    const addToCartWithSize = () => {
        // Only add the selected size to the product, preserving all other information
        // Do not modify or remove any existing data
        const productWithSize = {
            ...product,
            selectedSize,
            price: currentPrice
        };
        
        // Call the handleAddToCart function with the customized product
        handleAddToCart(productWithSize, quantity);
    };

    // Buy now with selected size
    const buyNowWithSize = () => {
        // Only add the selected size to the product, preserving all other information
        // Do not modify or remove any existing data
        const productWithSize = {
            ...product,
            selectedSize,
            price: currentPrice
        };
        
        // Call the handleBuyNow function with the customized product
        handleBuyNow(productWithSize, quantity);
    };

    return (
        <div className="lg:w-1/2">
            <style>{scrollbarHideStyles}</style>
            
            {/* Product Header Section - Combined into this file */}
            <div className="lg:pt-0 md:mt-28 lg:mt-0">
                <h1 className="text-3xl font-medium mb-2">{product.name}</h1>

                {/* Overall stock status */}
                {product.stock <= 0 && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded-full border border-gray-300 bg-gray-200 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        </div>
                        <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">Out of stock</span>
                    </div>
                )}

                {/* Sale tag */}
                {product.discount > 0 && (
                    <div className="mb-2">
                        <p className="text-lg font-medium text-red-700">{product.discount}% SALE ONGOING !!</p>
                    </div>
                )}

                {/* Price */}
                <div className="mb-6 flex items-baseline gap-3">
                    {product.discount > 0 ? (
                        <>
                            <span className="text-lg line-through text-muted-foreground font-medium">
                                {formatPrice(currentPrice)}
                            </span>
                            <span className="text-2xl font-medium">
                                {formatPrice(getDiscountedPrice(currentPrice, product.discount))}
                            </span>
                            <Badge variant="outline" className="ml-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">Sale</Badge>
                        </>
                    ) : (
                        <span className="text-2xl font-medium">
                            {formatPrice(currentPrice)}
                        </span>
                    )}
                </div>

                {/* Short Product Description */}
                {product.shortDescription && (
                    <div className="mb-6">
                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.shortDescription }}></p>
                    </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium">Size</p>

                            {/* Stock status indicator */}
                            <div className="flex items-center">
                                <div className={`h-3 w-3 rounded-full mr-2 ${selectedSize &&
                                    product.sizes.find(s => s.name === selectedSize)?.stock > 0
                                    ? 'bg-green-500' : 'bg-red-500'}`}>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {selectedSize &&
                                    product.sizes.find(s => s.name === selectedSize)?.stock > 0
                                    ? 'In stock' : 'Out of stock'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => {
                                const isOutOfStock = size.stock <= 0;
                                return (
                                    <button
                                        key={size.name}
                                        onClick={() => !isOutOfStock && handleSizeChange(size)}
                                        disabled={isOutOfStock}
                                        className={`px-6 py-2 rounded-md border relative ${selectedSize === size.name
                                            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                            : isOutOfStock
                                                ? 'border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                                                : 'border-gray-300 bg-white text-black hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                                            }`}
                                    >
                                        {size.name}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="border-t border-gray-400 dark:border-gray-500 w-full absolute"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Quantity</p>
                    <div className="flex items-center w-32 border rounded-md">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-r-none"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                        >
                            -
                        </Button>
                        <div className="h-9 w-14 flex items-center justify-center">
                            {quantity}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-l-none"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= product.stock || product.stock === 0}
                        >
                            +
                        </Button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3 mb-8">
                    {product.stock > 0 ? (
                        <>
                            <Button
                                className="w-full py-6 text-base font-medium"
                                variant="outline"
                                onClick={addToCartWithSize}
                                disabled={product.stock === 0}
                            >
                                Add to cart
                            </Button>

                            <Button
                                className="w-full py-6 bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 text-base font-medium"
                                onClick={buyNowWithSize}
                                disabled={product.stock === 0}
                            >
                                Buy it now
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="w-full py-6 text-base font-medium bg-green-500 hover:bg-green-600 text-white cursor-not-allowed"
                            disabled
                        >
                            Sold out
                        </Button>
                    )}
                </div>

                {/* Short product teaser */}
                <div className="mb-10">
                    <h2 className="text-lg font-semibold mb-2">{product.name} — Built for Everyday Style. Designed to Stand Out.</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Looking for a <span className="font-medium">men&apos;s bracelet in Bangladesh</span> that you can wear with any outfit — one that lasts, without fading or tarnish?
                    </p>
                </div>
            </div>

            {/* Detailed sections - all part of the scrollable right column */}
            <div className="space-y-12">
                {/* Description Section - Combined into this file */}
                <section className="pt-4">
                    <h2 className="text-2xl font-bold mb-4">Product Description</h2>
                    <div className="prose prose-sm max-w-none">
                        <div className="text-muted-foreground leading-relaxed mb-4">
                            {product.description ? (
                                <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
                            ) : (
                                <>
                                    <p className="mb-2">
                                        <span className="font-medium">{product.name}</span> is built for that. Crafted with premium
                                        stainless steel that maintains its shine through daily wear.
                                    </p>
                                    <p className="mb-4">
                                        This premium {product.name} delivers exceptional quality and performance. Made with high-quality materials
                                        and attention to detail, it&apos;s designed to exceed your expectations and provide lasting value.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Detailed description */}
                        {!product.description && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Why Choose {product.name}?</h3>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    <li><span className="font-medium">Premium Quality:</span> Crafted from high-grade materials for maximum durability.</li>
                                    <li><span className="font-medium">Versatile Design:</span> Perfect for both casual and formal occasions.</li>
                                    <li><span className="font-medium">Comfort Fit:</span> Designed for all-day comfort without compromising on style.</li>
                                    <li><span className="font-medium">Long-lasting Performance:</span> Built to maintain its appearance even with daily use.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                <Separator />

                {/* Additional Information Section - Combined into this file */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">Additional Information</h2>

                    {product.additionalInfo ? (
                        <div className="prose prose-sm max-w-none mb-6">
                            <p className="text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.additionalInfo }}>
                            </p>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none mb-6">
                            <p className="text-muted-foreground leading-relaxed">
                                <strong>Brand:</strong> Selzio<br />
                                <strong>Category:</strong> {product.category}<br />
                                {product.subcategory && <><strong>Subcategory:</strong> {product.subcategory}<br /></>}
                                <strong>Product Code:</strong> {product.productCode}<br />
                                <strong>Stock:</strong> {product.stock} units<br />
                                <strong>Material:</strong> Premium Quality<br />
                                <strong>Returns:</strong> 30-day money-back guarantee<br />
                            </p>
                        </div>
                    )}
                </section>

                {/* Product Features - Combined into this file */}
                <div className="mb-8">
                    {/* Top feature cards */}
                    <div className="features-section flex justify-around items-center text-center mt-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl px-2.5 py-8 shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(255,255,255,0.08)] overflow-x-auto scrollbar-hide gap-3.5 mb-10" style={{ perspective: "1000px" }}>
                        <div className="feature-item flex-[1_1_30%] max-w-[120px] text-center bg-[linear-gradient(145deg,#ffffff,#e6e6e6)] dark:bg-[linear-gradient(145deg,#2a2a2a,#1a1a1a)] rounded-xl p-[15px] shadow-[5px_5px_15px_rgba(0,0,0,0.2),-5px_-5px_15px_rgba(255,255,255,0.7)] dark:shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out hover:shadow-[8px_8px_20px_rgba(0,0,0,0.25),-8px_-8px_20px_rgba(255,255,255,0.8)] dark:hover:shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(255,255,255,0.15)] hover:-translate-y-1 hover:rotate-y-12 cursor-pointer flex flex-col items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                            <div className="p-4 mb-3 bg-opacity-80 rounded-full">
                                <svg className="h-12 w-12 transition-transform duration-300 group-hover:scale-110 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 6H21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm">PERFECT FIT</h3>
                        </div>

                        <div className="feature-item flex-[1_1_30%] max-w-[120px] text-center bg-[linear-gradient(145deg,#ffffff,#e6e6e6)] dark:bg-[linear-gradient(145deg,#2a2a2a,#1a1a1a)] rounded-xl p-[15px] shadow-[5px_5px_15px_rgba(0,0,0,0.2),-5px_-5px_15px_rgba(255,255,255,0.7)] dark:shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out hover:shadow-[8px_8px_20px_rgba(0,0,0,0.25),-8px_-8px_20px_rgba(255,255,255,0.8)] dark:hover:shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(255,255,255,0.15)] hover:-translate-y-1 hover:rotate-y-12 cursor-pointer flex flex-col items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                            <div className="p-4 mb-3 bg-opacity-80 rounded-full">
                                <svg className="h-12 w-12 transition-transform duration-300 group-hover:scale-110 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm">COMFORTABLE</h3>
                        </div>

                        <div className="feature-item flex-[1_1_30%] max-w-[120px] text-center bg-[linear-gradient(145deg,#ffffff,#e6e6e6)] dark:bg-[linear-gradient(145deg,#2a2a2a,#1a1a1a)] rounded-xl p-[15px] shadow-[5px_5px_15px_rgba(0,0,0,0.2),-5px_-5px_15px_rgba(255,255,255,0.7)] dark:shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out hover:shadow-[8px_8px_20px_rgba(0,0,0,0.25),-8px_-8px_20px_rgba(255,255,255,0.8)] dark:hover:shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(255,255,255,0.15)] hover:-translate-y-1 hover:rotate-y-12 cursor-pointer flex flex-col items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                            <div className="p-4 mb-3 bg-opacity-80 rounded-full">
                                <svg className="h-12 w-12 transition-transform duration-300 group-hover:scale-110 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm">FAIR PRICE</h3>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Reviews Section - Kept as a separate component */}
                <ProductReviews product={product} toast={toast} />
            </div>
        </div>
    );
} 