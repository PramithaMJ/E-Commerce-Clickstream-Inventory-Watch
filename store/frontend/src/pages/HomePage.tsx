import React, { useEffect, useState } from 'react';
import { FiShoppingCart, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import CartModal from '../components/CartModal';
import { useCart } from '../hooks/useCart';
import { useSession } from '../hooks/useSession';
import { productService } from '../services/productService';
import { trackingService } from '../services/trackingService';
import { Product, Category } from '../types';

const categories: { value: Category; label: string }[] = [
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'audio', label: 'Audio' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'accessories', label: 'Accessories' },
];

const HomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
    const [priceRange, setPriceRange] = useState<'all' | 'under-500' | '500-1000' | '1000-2000' | 'over-2000'>('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    const { userId, sessionId } = useSession();
    const cart = useCart();

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchQuery, stockFilter, priceRange]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Stock filter
        if (stockFilter === 'in-stock') {
            filtered = filtered.filter(p => p.inStock);
        } else if (stockFilter === 'out-of-stock') {
            filtered = filtered.filter(p => !p.inStock);
        }

        // Price range filter
        if (priceRange === 'under-500') {
            filtered = filtered.filter(p => p.price < 500);
        } else if (priceRange === '500-1000') {
            filtered = filtered.filter(p => p.price >= 500 && p.price < 1000);
        } else if (priceRange === '1000-2000') {
            filtered = filtered.filter(p => p.price >= 1000 && p.price < 2000);
        } else if (priceRange === 'over-2000') {
            filtered = filtered.filter(p => p.price >= 2000);
        }

        // Search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                p =>
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(filtered);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery && userId && sessionId) {
            trackingService.trackSearch(searchQuery);
        }
    };

    const handleAddToCart = (product: Product) => {
        cart.addToCart({ product, quantity: 1 });
        
        if (userId && sessionId) {
            trackingService.trackAddToCart(
                product.id,
                product.name,
                product.category,
                product.price,
                1
            );
        }
        
        toast.success(`${product.name} added to cart!`);
    };

    const handleProductView = (product: Product) => {
        if (userId && sessionId) {
            trackingService.trackView(
                product.id,
                product.name,
                product.category,
                product.price
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">ElectroStore</h1>
                                <p className="text-xs text-gray-400">Premium Electronics</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                        >
                            <FiShoppingCart className="w-6 h-6" />
                            {cart.getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                                    {cart.getTotalItems()}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-4">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        </div>
                    </form>
                </div>
            </header>

            {/* Filters Section */}
            <div className="container mx-auto px-4 py-6">
                {/* Category Filter */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                        <FiFilter className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-300">Category</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                selectedCategory === 'all'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            All Products
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    selectedCategory === cat.value
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stock Status Filter */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-semibold text-gray-300">Availability</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setStockFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                stockFilter === 'all'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStockFilter('in-stock')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                stockFilter === 'in-stock'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            In Stock
                        </button>
                        <button
                            onClick={() => setStockFilter('out-of-stock')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                stockFilter === 'out-of-stock'
                                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            Out of Stock
                        </button>
                    </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-semibold text-gray-300">Price Range</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setPriceRange('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                priceRange === 'all'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            All Prices
                        </button>
                        <button
                            onClick={() => setPriceRange('under-500')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                priceRange === 'under-500'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            Under $500
                        </button>
                        <button
                            onClick={() => setPriceRange('500-1000')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                priceRange === '500-1000'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            $500 - $1,000
                        </button>
                        <button
                            onClick={() => setPriceRange('1000-2000')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                priceRange === '1000-2000'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            $1,000 - $2,000
                        </button>
                        <button
                            onClick={() => setPriceRange('over-2000')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                priceRange === 'over-2000'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            Over $2,000
                        </button>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {(selectedCategory !== 'all' || stockFilter !== 'all' || priceRange !== 'all') && (
                    <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="font-medium">Active Filters:</span>
                            {selectedCategory !== 'all' && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                                    {categories.find(c => c.value === selectedCategory)?.label}
                                </span>
                            )}
                            {stockFilter !== 'all' && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                                    {stockFilter === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                                </span>
                            )}
                            {priceRange !== 'all' && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                                    {priceRange === 'under-500' && 'Under $500'}
                                    {priceRange === '500-1000' && '$500-$1,000'}
                                    {priceRange === '1000-2000' && '$1,000-$2,000'}
                                    {priceRange === 'over-2000' && 'Over $2,000'}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setSelectedCategory('all');
                                setStockFilter('all');
                                setPriceRange('all');
                            }}
                            className="text-sm text-red-400 hover:text-red-300 font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Products Grid */}
            <main className="container mx-auto px-4 pb-12">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onView={handleProductView}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Modal */}
            <CartModal
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                userId={userId}
                sessionId={sessionId}
            />

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-6">
                <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
                    <p>© 2026 ElectroStore | Real-time Clickstream Analytics</p>
                    <p className="mt-2 text-xs">
                        Session: {sessionId?.substring(0, 8)} | User: {userId}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
