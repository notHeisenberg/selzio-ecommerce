"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Save, X, Upload, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductFormModal({ product, open, onClose, onSave, mode = 'add' }) {
    const [formData, setFormData] = useState({
        name: '',
        productCode: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        subcategory: '',
        tags: '',
        topSelling: false,
        image: '',
        discount: '',
        additionalInfo: '',
        sizes: []
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [images, setImages] = useState([]);
    const [editingImageIndex, setEditingImageIndex] = useState(null);
    const [uploadingImages, setUploadingImages] = useState({}); // Track uploading state per image
    const { toast } = useToast();

    const isEditMode = mode === 'edit' && product;

    useEffect(() => {
        if (isEditMode) {
            // Handle sizes array properly
            let sizesArray = [];
            if (product.sizes) {
                if (Array.isArray(product.sizes)) {
                    // Check if it's an array of objects (with name, stock, price)
                    if (product.sizes.length > 0 && typeof product.sizes[0] === 'object') {
                        sizesArray = product.sizes.map(s => ({
                            name: s.name || '',
                            stock: s.stock || 0,
                            price: s.price || ''
                        }));
                    } else {
                        // Array of strings (old format)
                        sizesArray = product.sizes.map(s => ({
                            name: s,
                            stock: 0,
                            price: ''
                        }));
                    }
                }
            }

            // Handle images array
            let imagesArray = [];
            if (product.image) {
                if (Array.isArray(product.image)) {
                    imagesArray = product.image.map(img => ({
                        url: img,
                        isEditing: false
                    }));
                } else if (typeof product.image === 'string') {
                    // Handle comma-separated string
                    imagesArray = product.image.split(',').map(img => ({
                        url: img.trim(),
                        isEditing: false
                    })).filter(img => img.url);
                }
            }

            setFormData({
                name: product.name || '',
                productCode: product.productCode || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                stock: product.stock?.toString() || '',
                category: product.category || '',
                subcategory: product.subcategory || '',
                tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
                topSelling: product.topSelling || false,
                image: Array.isArray(product.image) ? product.image.join(', ') : product.image || '',
                discount: product.discount?.toString() || '',
                additionalInfo: product.additionalInfo || '',
                sizes: sizesArray
            });
            setImages(imagesArray);
        } else {
            // Reset form for add mode
            setFormData({
                name: '',
                productCode: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                subcategory: '',
                tags: '',
                topSelling: false,
                image: '',
                discount: '',
                additionalInfo: '',
                sizes: []
            });
            setImages([]);
        }
        setErrors({});
        setEditingImageIndex(null);
    }, [product, isEditMode, open]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.productCode.trim()) newErrors.productCode = 'Product code is required';
        if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }
        if (!formData.stock.trim() || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
            newErrors.stock = 'Valid stock quantity is required';
        }
        if (!formData.category.trim()) newErrors.category = 'Category is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors before submitting.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            // Process sizes array - filter out empty entries and convert to proper format
            const processedSizes = formData.sizes
                .filter(size => size.name && size.name.trim())
                .map(size => {
                    const sizeObj = {
                        name: size.name.trim(),
                        stock: parseInt(size.stock) || 0
                    };
                    // Only include price if it's provided and valid
                    if (size.price && size.price.toString().trim() !== '') {
                        sizeObj.price = parseFloat(size.price);
                    }
                    return sizeObj;
                })
                .filter(size => size.name); // Extra filter to ensure name is not empty

            // Process images array
            const processedImages = images
                .map(img => img.url)
                .filter(url => url && url.trim());

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                image: processedImages,
                discount: formData.discount ? parseFloat(formData.discount) : 0,
                sizes: processedSizes.length > 0 ? processedSizes : []
            };

            await onSave(productData);

            toast({
                title: "Success",
                description: `Product ${isEditMode ? 'updated' : 'created'} successfully!`,
            });

            // Don't call onClose here - let parent component handle it
            // This prevents closing before the data refresh completes
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} product`,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Size management functions
    const addSize = () => {
        setFormData(prev => ({
            ...prev,
            sizes: [...prev.sizes, { name: '', stock: 0, price: '' }]
        }));
    };

    const removeSize = (index) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index)
        }));
    };

    const updateSize = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === index ? { ...size, [field]: value } : size
            )
        }));
    };

    // Image management functions
    const addImage = () => {
        setImages(prev => [...prev, { url: '', isEditing: true }]);
        setEditingImageIndex(images.length);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        if (editingImageIndex === index) {
            setEditingImageIndex(null);
        }
    };

    const updateImageUrl = (index, url) => {
        setImages(prev => prev.map((img, i) =>
            i === index ? { ...img, url } : img
        ));
    };

    const toggleImageEdit = (index) => {
        if (editingImageIndex === index) {
            // Save
            setEditingImageIndex(null);
            setImages(prev => prev.map((img, i) =>
                i === index ? { ...img, isEditing: false } : img
            ));
        } else {
            // Edit
            setEditingImageIndex(index);
            setImages(prev => prev.map((img, i) =>
                i === index ? { ...img, isEditing: true } : img
            ));
        }
    };

    const handleImageFileUpload = async (index, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File",
                description: "Please select an image file (JPEG, PNG, etc.)",
                variant: "destructive"
            });
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast({
                title: "File Too Large",
                description: "Image size must be less than 5MB",
                variant: "destructive"
            });
            return;
        }

        // Set uploading state for this image
        setUploadingImages(prev => ({ ...prev, [index]: true }));

        try {
            // Create form data for upload
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('subcategory', formData.subcategory || 'general');
            uploadFormData.append('category', formData.category || 'products');
            uploadFormData.append('productName', formData.name || 'unnamed');

            // Upload to Cloudinary via our API
            const response = await fetch('/api/cloudinary/product', {
                method: 'POST',
                body: uploadFormData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to upload image');
            }

            // Update the image URL with Cloudinary URL and exit edit mode
            setImages(prev => prev.map((img, i) =>
                i === index ? { ...img, url: result.data.secure_url, isEditing: false } : img
            ));
            setEditingImageIndex(null);

            toast({
                title: "Upload Successful",
                description: `Image uploaded to ${result.data.folder}`,
            });

        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload image to Cloudinary",
                variant: "destructive"
            });
        } finally {
            // Remove uploading state
            setUploadingImages(prev => {
                const newState = { ...prev };
                delete newState[index];
                return newState;
            });
        }
    };

    const predefinedCategories = [
        'Clothing','Beauty', 'Health', 'Perfumes'
    ];

    // Build categories list: include predefined categories + product's category if not in list
    const categories = [...predefinedCategories];
    if (formData.category && !categories.includes(formData.category)) {
        categories.push(formData.category);
    }
    // Sort alphabetically for better UX
    categories.sort();

    return (
        <AnimatePresence>
            {open && (
                <Dialog open={open} onOpenChange={onClose} >
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
                                        {isEditMode ? (
                                            <Edit className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <Plus className="h-5 w-5 text-green-600" />
                                        )}
                                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                                    </DialogTitle>
                                </motion.div>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Two Column Layout for MD+ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Basic Information */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Product Name *</Label>
                                                    <Input
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                                        placeholder="Enter product name"
                                                        className={errors.name ? 'border-red-500' : ''}
                                                    />
                                                    {errors.name && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-red-500 text-sm flex items-center gap-1"
                                                        >
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.name}
                                                        </motion.p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="productCode">Product Code *</Label>
                                                    <Input
                                                        id="productCode"
                                                        value={formData.productCode}
                                                        onChange={(e) => handleInputChange('productCode', e.target.value)}
                                                        placeholder="e.g., PROD001"
                                                        className={errors.productCode ? 'border-red-500' : ''}
                                                    />
                                                    {errors.productCode && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-red-500 text-sm flex items-center gap-1"
                                                        >
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.productCode}
                                                        </motion.p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="description">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={formData.description}
                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                        placeholder="Enter product description"
                                                        rows={6}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Categories & Tags */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Categories & Tags</h3>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="category">Category *</Label>
                                                    <Select
                                                        value={formData.category}
                                                        onValueChange={(value) => handleInputChange('category', value)}
                                                    >
                                                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(cat => (
                                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.category && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-red-500 text-sm flex items-center gap-1"
                                                        >
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.category}
                                                        </motion.p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="subcategory">Subcategory</Label>
                                                    <Input
                                                        id="subcategory"
                                                        value={formData.subcategory}
                                                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                                        placeholder="Enter subcategory"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="tags">Tags (comma separated)</Label>
                                                    <Input
                                                        id="tags"
                                                        value={formData.tags}
                                                        onChange={(e) => handleInputChange('tags', e.target.value)}
                                                        placeholder="e.g., popular, trending, sale"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="additionalInfo">Additional Information</Label>
                                                    <Textarea
                                                        id="additionalInfo"
                                                        value={formData.additionalInfo}
                                                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                                        placeholder="Enter additional product information, care instructions, specifications, etc."
                                                        rows={6}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Additional details like care instructions or specifications
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Pricing & Inventory with Images */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Pricing & Inventory</h3>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="price">Price (৳) *</Label>
                                                        <Input
                                                            id="price"
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.price}
                                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                                            placeholder="0.00"
                                                            className={errors.price ? 'border-red-500' : ''}
                                                        />
                                                        {errors.price && (
                                                            <motion.p
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="text-red-500 text-sm flex items-center gap-1"
                                                            >
                                                                <AlertCircle className="h-3 w-3" />
                                                                {errors.price}
                                                            </motion.p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="stock">Stock Quantity *</Label>
                                                        <Input
                                                            id="stock"
                                                            type="number"
                                                            value={formData.stock}
                                                            onChange={(e) => handleInputChange('stock', e.target.value)}
                                                            placeholder="0"
                                                            className={errors.stock ? 'border-red-500' : ''}
                                                        />
                                                        {errors.stock && (
                                                            <motion.p
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="text-red-500 text-sm flex items-center gap-1"
                                                            >
                                                                <AlertCircle className="h-3 w-3" />
                                                                {errors.stock}
                                                            </motion.p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="discount">Discount (%)</Label>
                                                    <Input
                                                        id="discount"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.1"
                                                        value={formData.discount}
                                                        onChange={(e) => handleInputChange('discount', e.target.value)}
                                                        placeholder="0"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Enter discount percentage (0-100)
                                                    </p>
                                                </div>

                                                {/* Size-wise Inventory */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Label>Size-wise Inventory</Label>
                                                                {formData.sizes.length > 0 && (
                                                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                                                                        {formData.sizes.length} {formData.sizes.length === 1 ? 'size' : 'sizes'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Add different sizes with individual stock quantities
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={addSize}
                                                            variant="outline"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>

                                                    {formData.sizes.length > 0 && (
                                                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                                            {formData.sizes.map((size, index) => (
                                                                <motion.div
                                                                    key={index}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: 10 }}
                                                                    className="flex items-start gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                                                                >
                                                                    <div className="flex-1 space-y-2">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Size Name *</Label>
                                                                            <Input
                                                                                value={size.name}
                                                                                onChange={(e) => updateSize(index, 'name', e.target.value)}
                                                                                placeholder="e.g., S, M, L"
                                                                                className="h-9"
                                                                            />
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div className="space-y-1">
                                                                                <Label className="text-xs">Stock *</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    value={size.stock}
                                                                                    onChange={(e) => updateSize(index, 'stock', e.target.value)}
                                                                                    placeholder="0"
                                                                                    className="h-9"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <Label className="text-xs text-muted-foreground">Price (৳)</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    value={size.price}
                                                                                    onChange={(e) => updateSize(index, 'price', e.target.value)}
                                                                                    placeholder="Optional"
                                                                                    className="h-9"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => removeSize(index)}
                                                                        className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {formData.sizes.length === 0 && (
                                                        <p className="text-sm text-muted-foreground text-center py-4 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                                            No sizes added. Click "Add" to add size-specific inventory.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Images Section */}
                                                <div className="space-y-3 pt-4 border-t border-blue-200 dark:border-blue-800">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Product Images</h4>
                                                            {(!formData.category || !formData.name) && (
                                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                                    ⚠️ {!formData.name && 'Enter product name'}{!formData.name && !formData.category && ' and '}{!formData.category && 'select category'} to organize images in Cloudinary
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={addImage}
                                                            variant="outline"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Add Image
                                                        </Button>
                                                    </div>

                                                    {/* Images List */}
                                                    {images.length > 0 && (
                                                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                                            {images.map((image, index) => (
                                                                <motion.div
                                                                    key={index}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                                                                >
                                                                    <div className="flex gap-3">
                                                                        {/* Image Preview */}
                                                                        <div className="flex-shrink-0">
                                                                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative">
                                                                                {uploadingImages[index] ? (
                                                                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                                                                        <motion.div
                                                                                            animate={{ rotate: 360 }}
                                                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                                            className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
                                                                                        />
                                                                                        <span className="text-xs text-blue-600 mt-2">Uploading...</span>
                                                                                    </div>
                                                                                ) : image.url ? (
                                                                                    <img
                                                                                        src={image.url}
                                                                                        alt={`Product ${index + 1}`}
                                                                                        className="w-full h-full object-cover"
                                                                                        onError={(e) => {
                                                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                                                        No Image
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Image URL Input and Actions */}
                                                                        <div className="flex-1 space-y-2">
                                                                            <div className="space-y-1">
                                                                                <Label className="text-xs">Image URL</Label>
                                                                                <Input
                                                                                    value={image.url}
                                                                                    onChange={(e) => updateImageUrl(index, e.target.value)}
                                                                                    placeholder="https://example.com/image.jpg"
                                                                                    disabled={!image.isEditing}
                                                                                    className="h-9"
                                                                                />
                                                                            </div>

                                                                            {/* File Upload Option (when editing) */}
                                                                            {image.isEditing && (
                                                                                <div className="space-y-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Label
                                                                                            htmlFor={`image-upload-${index}`}
                                                                                            className={`flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded transition-colors ${uploadingImages[index]
                                                                                                    ? 'opacity-50 cursor-not-allowed'
                                                                                                    : 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                                                                }`}
                                                                                        >
                                                                                            <Upload className="h-3 w-3" />
                                                                                            {uploadingImages[index] ? 'Uploading...' : 'Upload File'}
                                                                                        </Label>
                                                                                        <input
                                                                                            id={`image-upload-${index}`}
                                                                                            type="file"
                                                                                            accept="image/*"
                                                                                            className="hidden"
                                                                                            onChange={(e) => handleImageFileUpload(index, e)}
                                                                                            disabled={uploadingImages[index]}
                                                                                        />
                                                                                        <span className="text-xs text-muted-foreground">or paste URL above</span>
                                                                                    </div>
                                                                                    {formData.category && (
                                                                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                                                                            📁 Will upload to: products/{formData.category.toLowerCase()}
                                                                                            {formData.subcategory && `/${formData.subcategory.replace(/\s+/g, '_').toLowerCase()}`}
                                                                                            {formData.name && `/${formData.name.replace(/\s+/g, '_').toLowerCase()}`}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                            {/* Action Buttons */}
                                                                            <div className="flex items-center gap-2">
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => toggleImageEdit(index)}
                                                                                    className="h-7 text-xs"
                                                                                    disabled={uploadingImages[index]}
                                                                                >
                                                                                    {image.isEditing ? (
                                                                                        <>
                                                                                            <Save className="h-3 w-3 mr-1" />
                                                                                            Save
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Edit className="h-3 w-3 mr-1" />
                                                                                            Edit
                                                                                        </>
                                                                                    )}
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => removeImage(index)}
                                                                                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                                    disabled={uploadingImages[index]}
                                                                                >
                                                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                                                    Delete
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {images.length === 0 && (
                                                        <p className="text-sm text-muted-foreground text-center py-6 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                                            No images added. Click "Add Image" to add product images.
                                                        </p>
                                                    )}

                                                    <div className="flex items-center space-x-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                                        <Switch
                                                            id="topSelling"
                                                            checked={formData.topSelling}
                                                            onCheckedChange={(checked) => handleInputChange('topSelling', checked)}
                                                        />
                                                        <Label htmlFor="topSelling">Mark as Top Selling</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex justify-end gap-3 pt-6 border-t"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            type="button"
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
                                            type="submit"
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
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {isEditMode ? 'Update' : 'Create'} Product
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </form>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}

