"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Plus, Edit, Trash2, Search, Package, BarChart3, AlertCircle, Eye } from 'lucide-react';
import Image from 'next/image';
import ProductViewModal from '../product/ProductViewModal';
import ProductFormModal from '../product/ProductFormModal';
import ProductDeleteModal from '../product/ProductDeleteModal';

export default function ProductManagementTab() {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        recentOrders: 0,
        lowStockProducts: 0,
        ordersByStatus: {
            pending: 0,
            processing: 0,
            delivered: 0,
            cancelled: 0,
            cancellation_requested: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const { toast } = useToast();
    const { user } = useAuth();
    
    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formMode, setFormMode] = useState('add');
    
    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Get authentication token
            const token = localStorage.getItem('auth_token');
            
            // Create headers for authenticated requests
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Fetch both products and admin stats in parallel
            const [productsResponse, statsResponse] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/admin/stats', {
                    headers,
                    credentials: 'include'
                })
            ]);

            // Handle products response
            const productsData = await productsResponse.json();
            if (!productsResponse.ok) {
                throw new Error(productsData.error || 'Failed to fetch products');
            }

            // Handle stats response
            const statsData = await statsResponse.json();
            if (!statsResponse.ok) {
                console.warn('Failed to fetch admin stats:', statsData.error);
                // Continue with products data even if stats fail
            } else {
                setStats(statsData);
            }

            // Extract products data
            const fetchedProducts = productsData.products.map(product => ({
                id: product._id,
                name: product.name,
                productCode: product.productCode,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                subcategory: product.subcategory,
                tags: product.tags,
                topSelling: product.topSelling,
                discount: product.discount || 0,
                additionalInfo: product.additionalInfo,
                sizes: product.sizes,
                status: product.stock === 0 ? 'out_of_stock' : product.stock < 50 ? 'low_stock' : 'active',
                image: product.image || '/images/product-placeholder.png',
                orders: product.orders || 0, // Use default if not available
                revenue: product.revenue || 0,  // Use default if not available
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            }));

            setProducts(fetchedProducts);
            
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch data.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Product action handlers
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setViewModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setFormMode('edit');
        setFormModalOpen(true);
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setFormMode('add');
        setFormModalOpen(true);
    };

    const handleDeleteProduct = (product) => {
        setSelectedProduct(product);
        setDeleteModalOpen(true);
    };

    const handleSaveProduct = async (productData) => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            let response;
            if (formMode === 'edit' && selectedProduct) {
                // Update existing product
                response = await fetch(`/api/products/${selectedProduct.id}`, {
                    method: 'PUT',
                    headers,
                    credentials: 'include',
                    body: JSON.stringify(productData)
                });
            } else {
                // Create new product
                response = await fetch('/api/products', {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                    body: JSON.stringify(productData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${formMode === 'edit' ? 'update' : 'create'} product`);
            }

            // Refresh the products list
            await fetchData();
            
        } catch (error) {
            console.error('Product save error:', error);
            throw error; // Re-throw to be handled by the modal
        }
    };

    const handleProductDeletion = async (product) => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
                headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete product');
            }

            // Refresh the products list
            await fetchData();
            
        } catch (error) {
            console.error('Product deletion error:', error);
            throw error; // Re-throw to be handled by the modal
        }
    };

    // Filter products based on search and filter criteria
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || product.status === filter;
        return matchesSearch && matchesFilter;
    });

    // Calculate local product stats
    const productStats = {
        total: products?.length,
        active: products?.filter(p => p.status === 'active').length,
        outOfStock: products?.filter(p => p.status === 'out_of_stock').length,
        lowStock: products?.filter(p => p.status === 'low_stock').length,
        productRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
        productOrders: products.reduce((sum, p) => sum + p.orders, 0)
    };

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

    if (!isAdmin) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Admin access required to view this section.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Product Management
                    </CardTitle>
                    <CardDescription>
                        Manage your product catalog, inventory, and sales performance
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Total Products</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{stats.totalProducts}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {productStats.lowStock + productStats.outOfStock} low/out of stock
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Total Orders</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{stats.totalOrders.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.recentOrders} in last 7 days
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Total Revenue</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">৳{stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Avg: ৳{stats.avgOrderValue.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">Users</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Registered users
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardContent className="p-6">
                    <Tabs defaultValue="products" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="products">Products</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="products" className="space-y-4">
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex gap-2 items-center flex-1">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Select value={filter} onValueChange={setFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="low_stock">Low Stock</SelectItem>
                                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="hover:bg-primary/90" onClick={handleAddProduct}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                            </div>

                            {/* Products List */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading products...</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        {searchTerm || filter !== 'all' ? 'No products match your filters' : 'No products found'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredProducts.map((product) => (
                                        <div key={product.id} className="border rounded-sm p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                {/* Product Image */}
                                                <div className="relative w-16 h-16 rounded-sm overflow-hidden bg-muted flex-shrink-0">
                                                    <Image
                                                        src={Array.isArray(product?.image) ? product.image[0] : product?.image || '/images/product-placeholder.png'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                                
                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-medium truncate">{product.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{product.category}</p>
                                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    {product.discount && product.discount > 0 ? (
                                                                        <>
                                                                            <span className="font-medium text-green-600">
                                                                                ৳{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                                                            </span>
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="text-xs line-through text-gray-400">
                                                                                    ৳{product.price}
                                                                                </span>
                                                                                <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded">
                                                                                    -{product.discount}%
                                                                                </span>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <span className="font-medium">৳{product.price}</span>
                                                                    )}
                                                                </div>
                                                                <span className={`${
                                                                    product.stock === 0 ? 'text-red-600' :
                                                                    product.stock < 50 ? 'text-yellow-600' :
                                                                    'text-green-600'
                                                                }`}>
                                                                    Stock: {product.stock}
                                                                    {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                                                                        <span className="text-xs text-muted-foreground ml-1">
                                                                            ({product.sizes.length} sizes)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span className="text-muted-foreground">
                                                                    {product.orders} orders • ৳{product.revenue.toLocaleString()} revenue
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-4">
                                                            {getStatusBadge(product.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteProduct(product)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="analytics" className="space-y-4">
                            <div className="text-center py-12">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                                <p className="text-sm text-muted-foreground mt-2">Track sales performance, inventory trends, and more.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            
            {/* Modals */}
            <ProductViewModal
                product={selectedProduct}
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
            />

            <ProductFormModal
                product={selectedProduct}
                open={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSave={handleSaveProduct}
                mode={formMode}
            />

            <ProductDeleteModal
                product={selectedProduct}
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onDelete={handleProductDeletion}
            />
        </div>
    );
}
