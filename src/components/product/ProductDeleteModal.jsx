"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDeleteModal({ product, open, onClose, onDelete }) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setLoading(true);
        
        try {
            await onDelete(product);
            
            toast({
                title: "Success",
                description: "Product deleted successfully!",
            });

            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete product",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    return (
        <AnimatePresence>
            {open && (
                <Dialog open={open} onOpenChange={onClose}>
                    <DialogContent className="max-w-lg p-0">
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
                                    className="flex items-center gap-3"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        className="p-3 bg-red-100 rounded-full"
                                    >
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </motion.div>
                                    <div>
                                        <DialogTitle className="text-xl text-gray-900">
                                            Delete Product
                                        </DialogTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            This action cannot be undone
                                        </p>
                                    </div>
                                </motion.div>
                            </DialogHeader>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                {/* Warning Message */}
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-gray-700">
                                        Are you sure you want to delete{' '}
                                        <span className="font-semibold text-red-700">
                                            "{product.name}"
                                        </span>?
                                    </p>
                                    <p className="text-xs text-red-600 mt-2">
                                        This will permanently remove the product and all associated data.
                                    </p>
                                </div>

                                {/* Product Info */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-4 bg-gray-50 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Trash2 className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {product.category} • ৳{product.price} • Stock: {product.stock}
                                            </p>
                                            {product.productCode && (
                                                <p className="text-xs text-muted-foreground">
                                                    Code: {product.productCode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Impact Warning */}
                                {(product.orders > 0 || product.revenue > 0) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
                                    >
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">
                                                    Product Performance Warning
                                                </p>
                                                <p className="text-xs text-amber-700 mt-1">
                                                    This product has generated{' '}
                                                    <span className="font-semibold">{product.orders} orders</span> and{' '}
                                                    <span className="font-semibold">৳{product.revenue?.toLocaleString()} revenue</span>.
                                                    Deleting it will remove these statistics.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex justify-end gap-3 mt-8 pt-6 border-t"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button 
                                        variant="outline" 
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </motion.div>
                                
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button 
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="min-w-[120px]"
                                    >
                                        {loading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Product
                                            </>
                                        )}
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
