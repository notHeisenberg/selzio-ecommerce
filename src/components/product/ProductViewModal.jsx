"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, BarChart3, Calendar, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductViewModal({ product, open, onClose }) {
    if (!product) return null;

    const getStatusBadge = (status) => {
        const variants = {
            active: 'bg-green-500',
            out_of_stock: 'bg-red-500',
            low_stock: 'bg-yellow-500',
            inactive: 'bg-gray-500'
        };
        
        const labels = {
            active: 'Active',
            out_of_stock: 'Out of Stock',
            low_stock: 'Low Stock',
            inactive: 'Inactive'
        };

        return (
            <Badge className={`${variants[status] || 'bg-gray-500'} text-white`}>
                {labels[status] || status}
            </Badge>
        );
    };

    return (
        <AnimatePresence>
            {open && (
                <Dialog open={open} onOpenChange={onClose}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="p-6"
                        >
                            <DialogHeader className="mb-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <DialogTitle className="flex items-center gap-2 text-xl">
                                        <Package className="h-5 w-5 text-primary" />
                                        Product Details
                                    </DialogTitle>
                                </motion.div>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Product Images */}
                                <motion.div 
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-4"
                                >
                                    <motion.div 
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative w-full h-72 rounded-xl overflow-hidden bg-muted shadow-lg"
                                    >
                                        <Image
                                            src={Array.isArray(product.image) ? product.image[0] : product.image || '/images/product-placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = '/images/product-placeholder.png';
                                            }}
                                        />
                                    </motion.div>
                                    
                                    {/* Additional images if available */}
                                    {Array.isArray(product.image) && product.image.length > 1 && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="grid grid-cols-3 gap-3"
                                        >
                                            {product.image.slice(1, 4).map((img, index) => (
                                                <motion.div 
                                                    key={index}
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="relative h-20 rounded-lg overflow-hidden bg-muted shadow-md"
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`${product.name} ${index + 2}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Product Information */}
                                <motion.div 
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-6"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
                                        <p className="text-lg text-muted-foreground">{product.category}</p>
                                        {product.subcategory && (
                                            <p className="text-sm text-muted-foreground">{product.subcategory}</p>
                                        )}
                                    </motion.div>

                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-center gap-3"
                                    >
                                        {getStatusBadge(product.status)}
                                        {product.topSelling && (
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                🔥 Top Selling
                                            </Badge>
                                        )}
                                    </motion.div>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="grid grid-cols-2 gap-6"
                                    >
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                                            <p className="text-sm text-blue-600 font-medium">Price</p>
                                            <div className="flex items-baseline gap-2">
                                                {product.discount && product.discount > 0 ? (
                                                    <>
                                                        <p className="text-3xl font-bold text-blue-900">
                                                            ৳{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                                        </p>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm line-through text-gray-500">
                                                                ৳{product.price}
                                                            </span>
                                                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                                                                -{product.discount}%
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-3xl font-bold text-blue-900">৳{product.price}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                                            <p className="text-sm text-green-600 font-medium">Stock</p>
                                            <p className={`text-3xl font-bold ${
                                                product.stock === 0 ? 'text-red-600' :
                                                product.stock < 50 ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                                {product.stock}
                                            </p>
                                            {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-green-600 font-medium mb-1">Available Sizes:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.sizes.map((size, index) => (
                                                            <span key={index} className="px-2 py-1 bg-white text-green-700 text-xs rounded border border-green-200">
                                                                {typeof size === 'string' ? size : size.name || size.toString()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <motion.div 
                                            whileHover={{ scale: 1.02 }}
                                            className="p-4 bg-purple-50 rounded-xl border border-purple-100"
                                        >
                                            <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                                                <BarChart3 className="h-4 w-4" />
                                                Total Orders
                                            </div>
                                            <p className="text-2xl font-bold text-purple-900">{product.orders || 0}</p>
                                        </motion.div>
                                        <motion.div 
                                            whileHover={{ scale: 1.02 }}
                                            className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                                        >
                                            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                                <BarChart3 className="h-4 w-4" />
                                                Revenue
                                            </div>
                                            <p className="text-2xl font-bold text-emerald-900">৳{(product.revenue || 0).toLocaleString()}</p>
                                        </motion.div>
                                    </motion.div>

                                    {product.description && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="p-4 bg-gray-50 rounded-xl"
                                        >
                                            <p className="text-sm text-muted-foreground mb-2 font-medium">Description</p>
                                            <p className="text-sm leading-relaxed text-gray-700">{product.description}</p>
                                        </motion.div>
                                    )}

                                    {product.additionalInfo && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.75 }}
                                            className="p-4 bg-blue-50 rounded-xl border border-blue-100"
                                        >
                                            <p className="text-sm text-blue-600 mb-2 font-medium">Additional Information</p>
                                            <p className="text-sm leading-relaxed text-blue-700">{product.additionalInfo}</p>
                                        </motion.div>
                                    )}

                                    {product.tags && product.tags.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 }}
                                        >
                                            <p className="text-sm text-muted-foreground mb-3 font-medium">Tags</p>
                                            <div className="flex flex-wrap gap-2">
                                                {product.tags.map((tag, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.8 + index * 0.1 }}
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        <Badge variant="outline" className="text-xs hover:bg-primary hover:text-white transition-colors">
                                                            {tag}
                                                        </Badge>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Additional Details */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="space-y-3 text-sm text-muted-foreground bg-gray-50 p-4 rounded-xl"
                                    >
                                        {product.productCode && (
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                <span className="font-medium">Product Code:</span> {product.productCode}
                                            </div>
                                        )}
                                        {product.createdAt && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleDateString()}
                                            </div>
                                        )}
                                        {product.updatedAt && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span className="font-medium">Updated:</span> {new Date(product.updatedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Close Button */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0 }}
                                className="flex justify-end mt-8 pt-6 border-t"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button onClick={onClose} variant="outline" className="min-w-[100px]">
                                        Close
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
