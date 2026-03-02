"use client";

import { useState, useEffect, useCallback } from 'react';
import { roundToNext10 } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Save, X, Upload, AlertCircle, Trash2, Package, Sparkles, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pre-built suggestion combo templates
const SUGGESTION_TEMPLATES = [
    {
        name: '3-Polo Classic Mix',
        description: 'Classic 3-polo combo with premium old money designs. Mix and match colors and sizes.',
        productCount: 3,
    },
    {
        name: '2-Perfume Oil Bundle',
        description: 'Premium perfume oil duo for all-day fragrance.',
        productCount: 2,
    },
    {
        name: 'Full Old Money Set',
        description: 'Complete old money look with polo, accessories and fragrance.',
        productCount: 4,
    },
];

export default function ComboFormModal({ combo, open, onClose, onSave, mode = 'add', allProducts = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPercentage: '',
        featured: false,
        image: '',
    });
    const [comboProducts, setComboProducts] = useState([]);
    const [sizeDiscounts, setSizeDiscounts] = useState([]);
    const [suggestedCombinations, setSuggestedCombinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [mainImageUploading, setMainImageUploading] = useState(false);
    const [openProductPopover, setOpenProductPopover] = useState({});
    const [productSearchQueries, setProductSearchQueries] = useState({});
    const { toast } = useToast();

    const isEditMode = mode === 'edit' && combo;

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: combo.name || '',
                description: combo.description || '',
                price: combo.price?.toString() || '',
                discountPercentage: combo.discountPercentage?.toString() || '',
                featured: combo.featured || false,
                image: Array.isArray(combo.image) ? combo.image[0] : combo.image || '',
            });

            // Load size discounts
            if (combo.sizeDiscounts && combo.sizeDiscounts.length > 0) {
                setSizeDiscounts(combo.sizeDiscounts.map(sd => ({
                    size: sd.size || '',
                    comboPrice: sd.comboPrice?.toString() || '',
                    saveAmount: sd.saveAmount?.toString() || '',
                })));
            } else {
                setSizeDiscounts([]);
            }

            // Rebuild combo products from productOptions or products array
            const existingProducts = combo.products || combo.productOptions || [];
            if (Array.isArray(existingProducts) && existingProducts.length > 0) {
                if (typeof existingProducts[0] === 'string') {
                    const mapped = existingProducts.map(code => {
                        const found = allProducts.find(p => p.productCode === code);
                        return {
                            productCode: code,
                            name: found?.name || code,
                            image: found?.image ? (Array.isArray(found.image) ? found.image[0] : found.image) : '',
                        };
                    });
                    setComboProducts(mapped);
                } else {
                    const mapped = existingProducts.map(p => ({
                        productCode: p.productCode || '',
                        name: p.name || '',
                        image: p.image ? (Array.isArray(p.image) ? p.image[0] : p.image) : '',
                    }));
                    setComboProducts(mapped);
                }
            } else {
                setComboProducts([]);
            }

            setSuggestedCombinations(combo.suggestedCombinations || []);
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                discountPercentage: '',
                featured: false,
                image: '',
            });
            setComboProducts([]);
            setSizeDiscounts([]);
            setSuggestedCombinations([]);
        }
        setErrors({});
    }, [combo, isEditMode, open, allProducts]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Combo name is required';
        if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid base price is required';
        }
        if (comboProducts.length === 0) {
            newErrors.products = 'At least one product is required';
        }
        if (sizeDiscounts.length === 0) {
            newErrors.sizeDiscounts = 'At least one size pricing entry is required';
        }
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
            // Process main image
            const processedImage = formData.image ? [formData.image] : [];

            // Process size discounts
            const processedSizeDiscounts = sizeDiscounts.map(sd => ({
                size: sd.size,
                comboPrice: parseFloat(sd.comboPrice) || 0,
                saveAmount: parseFloat(sd.saveAmount) || 0,
            }));

            // Calculate min/max for card display
            const prices = processedSizeDiscounts.map(sd => sd.comboPrice).filter(p => p > 0);
            const saves = processedSizeDiscounts.map(sd => sd.saveAmount).filter(s => s > 0);

            const discountPct = parseFloat(formData.discountPercentage) || 0;

            const comboData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                discountPercentage: discountPct,
                featured: formData.featured,
                image: processedImage,
                images: processedImage,
                sizeDiscounts: processedSizeDiscounts,
                minComboPrice: prices.length > 0 ? Math.min(...prices) : parseFloat(formData.price),
                maxSaveAmount: saves.length > 0 ? Math.max(...saves) : 0,
                productOptions: comboProducts.map(p => p.productCode),
                products: comboProducts.map(p => ({
                    productCode: p.productCode,
                    name: p.name,
                    image: p.image,
                })),
                suggestedCombinations: suggestedCombinations,
            };

            await onSave(comboData);

            toast({
                title: "Success",
                description: `Combo ${isEditMode ? 'updated' : 'created'} successfully!`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} combo`,
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

    // Auto-recalculate size combo prices when discount percentage or base price changes
    const recalculateSizePrices = useCallback(() => {
        const basePrice = parseFloat(formData.price);
        const discountPct = parseFloat(formData.discountPercentage);
        if (!basePrice || !discountPct || discountPct <= 0) return;

        setSizeDiscounts(prev => prev.map(sd => {
            const discounted = roundToNext10(basePrice * (1 - discountPct / 100));
            const save = basePrice - discounted;
            return {
                ...sd,
                comboPrice: discounted.toString(),
                saveAmount: save > 0 ? save.toString() : '0',
            };
        }));
    }, [formData.price, formData.discountPercentage]);

    // --- Combo Products ---
    const addComboProduct = () => {
        setComboProducts(prev => [...prev, { productCode: '', name: '', image: '' }]);
        if (errors.products) {
            setErrors(prev => ({ ...prev, products: undefined }));
        }
    };

    const removeComboProduct = (index) => {
        setComboProducts(prev => prev.filter((_, i) => i !== index));
    };

    const handleProductSelect = (index, productCode) => {
        const product = allProducts.find(p => p.productCode === productCode);
        if (product) {
            const firstImage = Array.isArray(product.image)
                ? product.image[0]
                : product.image || '';
            setComboProducts(prev => prev.map((p, i) =>
                i === index ? {
                    productCode: product.productCode,
                    name: product.name,
                    image: firstImage,
                } : p
            ));
        }
    };

    // Handle typing a custom product name (not from database)
    const handleCustomProductName = (index, customName) => {
        setComboProducts(prev => prev.map((p, i) =>
            i === index ? {
                productCode: customName.toLowerCase().replace(/\s+/g, '-'),
                name: customName,
                image: '',
            } : p
        ));
    };

    // --- Suggestion Combos ---
    const addSuggestion = () => {
        setSuggestedCombinations(prev => [...prev, { name: '', products: [], sizes: [] }]);
    };

    const removeSuggestion = (index) => {
        setSuggestedCombinations(prev => prev.filter((_, i) => i !== index));
    };

    const updateSuggestionName = (index, name) => {
        setSuggestedCombinations(prev => prev.map((s, i) =>
            i === index ? { ...s, name } : s
        ));
    };

    const addProductToSuggestion = (suggestionIndex) => {
        setSuggestedCombinations(prev => prev.map((s, i) =>
            i === suggestionIndex ? {
                ...s,
                products: [...s.products, '']
            } : s
        ));
    };

    const updateSuggestionProduct = (suggestionIndex, productIndex, productCode) => {
        setSuggestedCombinations(prev => prev.map((s, i) =>
            i === suggestionIndex ? {
                ...s,
                products: s.products.map((p, j) => j === productIndex ? productCode : p)
            } : s
        ));
    };

    const updateSuggestionSize = (suggestionIndex, productIndex, size) => {
        setSuggestedCombinations(prev => prev.map((s, i) =>
            i === suggestionIndex ? {
                ...s,
                sizes: s.sizes.map((sz, j) => j === productIndex ? size : sz)
            } : s
        ));
    };

    const removeSuggestionProduct = (suggestionIndex, productIndex) => {
        setSuggestedCombinations(prev => prev.map((s, i) =>
            i === suggestionIndex ? {
                ...s,
                products: s.products.filter((_, j) => j !== productIndex)
            } : s
        ));
    };

    // Apply a pre-built template
    const applyTemplate = (template) => {
        handleInputChange('name', template.name);
        handleInputChange('description', template.description);
        // Create empty product slots
        const slots = Array(template.productCount).fill(null).map(() => ({
            productCode: '', name: '', image: ''
        }));
        setComboProducts(slots);
        toast({
            title: "Template Applied",
            description: `"${template.name}" template loaded. Select products to complete the combo.`,
        });
    };

    // Main image upload
    const handleMainImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File Too Large", description: "Image must be less than 5MB.", variant: "destructive" });
            return;
        }

        setMainImageUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('subcategory', 'combos');
            uploadFormData.append('category', 'combos');
            uploadFormData.append('productName', formData.name || 'combo');

            const response = await fetch('/api/cloudinary/product', {
                method: 'POST',
                body: uploadFormData,
            });
            const result = await response.json();

            if (!result.success) throw new Error(result.error || 'Upload failed');

            handleInputChange('image', result.data.secure_url);
            toast({ title: "Upload Successful", description: "Combo image uploaded." });
        } catch (error) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setMainImageUploading(false);
        }
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
                                        {isEditMode ? (
                                            <Edit className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <Plus className="h-5 w-5 text-green-600" />
                                        )}
                                        {isEditMode ? 'Edit Combo' : 'Add New Combo'}
                                    </DialogTitle>
                                </motion.div>
                            </DialogHeader>

                            {/* Quick Templates (only in add mode) */}
                            {!isEditMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Quick Templates</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTION_TEMPLATES.map((template, index) => (
                                            <Button
                                                key={index}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => applyTemplate(template)}
                                                className="text-xs"
                                            >
                                                {template.name}
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column - Basic Info */}
                                    <div className="space-y-6">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>

                                            <div className="space-y-2">
                                                <Label htmlFor="comboName">Combo Name *</Label>
                                                <Input
                                                    id="comboName"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="e.g., 3-Polo Old Money Combo"
                                                    className={errors.name ? 'border-red-500' : ''}
                                                />
                                                {errors.name && (
                                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="comboDescription">Description</Label>
                                                <Textarea
                                                    id="comboDescription"
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    placeholder="Describe this combo..."
                                                    rows={4}
                                                />
                                            </div>
                                        </motion.div>

                                        {/* Main Image */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl"
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Combo Image</h3>
                                            <div className="space-y-3">
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border">
                                                        {mainImageUploading ? (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                    className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                                                                />
                                                            </div>
                                                        ) : formData.image ? (
                                                            <img src={formData.image} alt="Combo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            value={formData.image}
                                                            onChange={(e) => handleInputChange('image', e.target.value)}
                                                            placeholder="Image URL"
                                                            className="h-9"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Label
                                                                htmlFor="combo-image-upload"
                                                                className={`flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded transition-colors ${mainImageUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                                    }`}
                                                            >
                                                                <Upload className="h-3 w-3" />
                                                                {mainImageUploading ? 'Uploading...' : 'Upload'}
                                                            </Label>
                                                            <input
                                                                id="combo-image-upload"
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={handleMainImageUpload}
                                                                disabled={mainImageUploading}
                                                            />
                                                            <span className="text-xs text-muted-foreground">or paste URL</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Right Column - Pricing & Products */}
                                    <div className="space-y-6">
                                        {/* Size-based Pricing */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Pricing</h3>

                                            <div className="space-y-2">
                                                <Label htmlFor="comboPrice">Base Price (৳) *</Label>
                                                <Input
                                                    id="comboPrice"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.price}
                                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                                    placeholder="Total base price without discount"
                                                    className={errors.price ? 'border-red-500' : ''}
                                                />
                                                {errors.price && (
                                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.price}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">Original price before any discount</p>
                                            </div>

                                            {/* Discount Percentage */}
                                            <div className="space-y-2">
                                                <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="discountPercentage"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        value={formData.discountPercentage}
                                                        onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                                                        placeholder="e.g., 15"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={recalculateSizePrices}
                                                        disabled={!formData.price || !formData.discountPercentage}
                                                        className="whitespace-nowrap"
                                                    >
                                                        Apply to Sizes
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Discount % off base price. Click "Apply to Sizes" to auto-fill combo prices (rounded to nearest ৳10).</p>
                                            </div>

                                            {/* Size Discounts Table */}
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="font-medium">Size-wise Pricing & Discounts *</Label>
                                                        <p className="text-xs text-muted-foreground mt-0.5">Set different combo price and save amount per size</p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSizeDiscounts(prev => [...prev, { size: '', comboPrice: '', saveAmount: '' }])}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" /> Add Size
                                                    </Button>
                                                </div>

                                                {errors.sizeDiscounts && (
                                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.sizeDiscounts}
                                                    </p>
                                                )}

                                                {sizeDiscounts.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {/* Header */}
                                                        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                                                            <span>Size</span>
                                                            <span>Combo Price (৳)</span>
                                                            <span>Save Amount (৳)</span>
                                                            <span className="w-8"></span>
                                                        </div>
                                                        {sizeDiscounts.map((sd, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center"
                                                            >
                                                                <Input
                                                                    value={sd.size}
                                                                    onChange={(e) => {
                                                                        const updated = [...sizeDiscounts];
                                                                        updated[index] = { ...updated[index], size: e.target.value };
                                                                        setSizeDiscounts(updated);
                                                                    }}
                                                                    placeholder="e.g., 3.5ml"
                                                                    className="h-8 text-sm"
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="1"
                                                                    value={sd.comboPrice}
                                                                    onChange={(e) => {
                                                                        const updated = [...sizeDiscounts];
                                                                        updated[index] = { ...updated[index], comboPrice: e.target.value };
                                                                        setSizeDiscounts(updated);
                                                                    }}
                                                                    placeholder="420"
                                                                    className="h-8 text-sm"
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="1"
                                                                    value={sd.saveAmount}
                                                                    onChange={(e) => {
                                                                        const updated = [...sizeDiscounts];
                                                                        updated[index] = { ...updated[index], saveAmount: e.target.value };
                                                                        setSizeDiscounts(updated);
                                                                    }}
                                                                    placeholder="100"
                                                                    className="h-8 text-sm"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setSizeDiscounts(prev => prev.filter((_, i) => i !== index))}
                                                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground text-center py-3 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                                        No size pricing added. Click "Add Size" to set per-size pricing.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                <Switch
                                                    id="comboFeatured"
                                                    checked={formData.featured}
                                                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                                                />
                                                <Label htmlFor="comboFeatured" className="text-sm cursor-pointer">
                                                    Featured on Homepage
                                                </Label>
                                            </div>
                                        </motion.div>

                                        {/* Combo Products */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.35 }}
                                            className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Combo Products</h3>
                                                        {comboProducts.length > 0 && (
                                                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                                                                {comboProducts.length} {comboProducts.length === 1 ? 'product' : 'products'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Select products from the dropdown
                                                    </p>
                                                </div>
                                                <Button type="button" size="sm" onClick={addComboProduct} variant="outline">
                                                    <Plus className="h-4 w-4 mr-1" /> Add
                                                </Button>
                                            </div>

                                            {errors.products && (
                                                <p className="text-red-500 text-sm flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.products}
                                                </p>
                                            )}

                                            {comboProducts.length > 0 ? (
                                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                                    {comboProducts.map((cp, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                                                        >
                                                            {/* Product image thumbnail */}
                                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border flex-shrink-0">
                                                                <img
                                                                    src={cp.image || '/images/product-placeholder.png'}
                                                                    alt={cp.name || 'Product'}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = '/images/product-placeholder.png'; }}
                                                                />
                                                            </div>

                                                            {/* Searchable product selector */}
                                                            <div className="flex-1 min-w-0">
                                                                <Popover
                                                                    open={openProductPopover[index] || false}
                                                                    onOpenChange={(open) => {
                                                                        setOpenProductPopover(prev => ({ ...prev, [index]: open }));
                                                                        if (!open) setProductSearchQueries(prev => ({ ...prev, [index]: '' }));
                                                                    }}
                                                                    modal={true}
                                                                >
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            role="combobox"
                                                                            className="h-9 w-full justify-between font-normal text-sm"
                                                                        >
                                                                            <span className="truncate">
                                                                                {cp.name || 'Search or type product name...'}
                                                                            </span>
                                                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-[300px] p-0" align="start" onWheel={(e) => e.stopPropagation()} onOpenAutoFocus={(e) => e.preventDefault()}>
                                                                        <Command shouldFilter={true}>
                                                                            <CommandInput
                                                                                placeholder="Type product name..."
                                                                                onValueChange={(value) => setProductSearchQueries(prev => ({ ...prev, [index]: value }))}
                                                                            />
                                                                            <CommandList>
                                                                                <CommandEmpty>
                                                                                    {productSearchQueries[index] ? (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded cursor-pointer"
                                                                                            onClick={() => {
                                                                                                handleCustomProductName(index, productSearchQueries[index]);
                                                                                                setOpenProductPopover(prev => ({ ...prev, [index]: false }));
                                                                                                setProductSearchQueries(prev => ({ ...prev, [index]: '' }));
                                                                                            }}
                                                                                        >
                                                                                            <span className="text-primary font-medium">+ Add &quot;{productSearchQueries[index]}&quot;</span>
                                                                                            <span className="block text-xs text-muted-foreground">as custom product name</span>
                                                                                        </button>
                                                                                    ) : (
                                                                                        <span>Type to search or add a custom name</span>
                                                                                    )}
                                                                                </CommandEmpty>
                                                                                <CommandGroup>
                                                                                    {allProducts.map(product => (
                                                                                        <CommandItem
                                                                                            key={product.productCode}
                                                                                            value={product.name}
                                                                                            onSelect={() => {
                                                                                                handleProductSelect(index, product.productCode);
                                                                                                setOpenProductPopover(prev => ({ ...prev, [index]: false }));
                                                                                                setProductSearchQueries(prev => ({ ...prev, [index]: '' }));
                                                                                            }}
                                                                                            className="flex items-center gap-2"
                                                                                        >
                                                                                            <img
                                                                                                src={Array.isArray(product.image) ? product.image[0] : product.image || '/images/product-placeholder.png'}
                                                                                                alt={product.name}
                                                                                                className="w-6 h-6 rounded object-cover flex-shrink-0"
                                                                                                onError={(e) => { e.target.src = '/images/product-placeholder.png'; }}
                                                                                            />
                                                                                            <span className="truncate flex-1">{product.name}</span>
                                                                                            {cp.productCode === product.productCode && (
                                                                                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                                                            )}
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandGroup>
                                                                            </CommandList>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>

                                                            {/* Remove button */}
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => removeComboProduct(index)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                                    No products added. Click "Add" to select products for this combo.
                                                </p>
                                            )}
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Suggestion Combos Section - Full Width */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Sub-Combos</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Pre-built product sets users can quick-select. Products are chosen from this combo&apos;s product list above.
                                            </p>
                                        </div>
                                        <Button type="button" size="sm" onClick={addSuggestion} variant="outline">
                                            <Plus className="h-4 w-4 mr-1" /> Add Sub-Combo
                                        </Button>
                                    </div>

                                    {suggestedCombinations.length > 0 ? (
                                        <div className="space-y-4">
                                            {suggestedCombinations.map((suggestion, sIndex) => (
                                                <motion.div
                                                    key={sIndex}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Input
                                                            value={suggestion.name}
                                                            onChange={(e) => updateSuggestionName(sIndex, e.target.value)}
                                                            placeholder="Sub-combo name (e.g., Luxury, Oud & Spicy)"
                                                            className="h-8 text-sm flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => removeSuggestion(sIndex)}
                                                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {suggestion.products.map((productCode, pIndex) => (
                                                            <div key={pIndex} className="flex items-center gap-2">
                                                                <Select
                                                                    value={productCode || undefined}
                                                                    onValueChange={(value) => updateSuggestionProduct(sIndex, pIndex, value)}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs flex-1">
                                                                        <SelectValue placeholder="Select product from combo" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {comboProducts.filter(p => p.productCode).map(product => (
                                                                            <SelectItem key={product.productCode} value={product.productCode}>
                                                                                {product.name || product.productCode}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => removeSuggestionProduct(sIndex, pIndex)}
                                                                    className="text-red-500 h-8 w-8 p-0"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => addProductToSuggestion(sIndex)}
                                                            className="text-xs h-7"
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" /> Add Product
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-3 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                            No suggestion combos. Add suggestions to show quick-pick options on the storefront.
                                        </p>
                                    )}
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex justify-end gap-3 pt-4 border-t"
                                >
                                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="min-w-[120px]">
                                        {loading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                {isEditMode ? 'Update Combo' : 'Create Combo'}
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
