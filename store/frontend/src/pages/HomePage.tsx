import React, { useEffect, useState } from 'react';
import { FiShoppingCart, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import CartModal from '../components/CartModal';
import TopBar from '../components/TopBar';
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
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 max-w-[1400px]">
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex items-center space-x-3 shrink-0">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-red-500 tracking-tight">AliElectro</h1>
                                <p className="text-xs text-gray-500 font-medium">Smarter Shopping, Better Living.</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden md:block group">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="I'm shopping for..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-6 pr-24 py-2.5 bg-white text-gray-900 rounded-full border-2 border-red-500 focus:outline-none transition-all placeholder-gray-400 shadow-sm"
                                />
                                <button type="submit" className="absolute right-1 top-1 bottom-1 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-colors flex items-center">
                                    <FiSearch className="w-5 h-5 mr-1" />
                                </button>
                            </div>
                        </form>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                        >
                            <div className="p-2 bg-gray-100 rounded-full text-gray-700">
                                <FiShoppingCart className="w-6 h-6" />
                            </div>
                            <div className="hidden sm:block text-left">
                                <span className="block text-xs text-gray-500 font-medium">Cart</span>
                                <span className="block text-sm font-bold text-gray-900">
                                    {cart.getTotalItems()} items
                                </span>
                            </div>
                            {cart.getTotalItems() > 0 && (
                                <span className="absolute top-0 left-6 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center border-2 border-white">
                                    {cart.getTotalItems()}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Mobile Search Bar */}
                    <form onSubmit={handleSearch} className="mt-4 md:hidden">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="I'm shopping for..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-12 py-2 bg-white text-gray-900 rounded-full border-2 border-red-500 focus:outline-none placeholder-gray-400"
                            />
                            <button type="submit" className="absolute right-1 top-1 bottom-1 px-4 bg-red-500 text-white rounded-full flex items-center">
                                <FiSearch className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </header>

            {/* Filters Section */}
            <div className="container mx-auto px-4 py-6 max-w-[1400px]">
                {/* Category Filter */}
                <div className="mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                        <FiFilter className="text-red-500" />
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Categories</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                selectedCategory === 'all'
                                    ? 'bg-red-50 border-red-500 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                    selectedCategory === cat.value
                                        ? 'bg-red-50 border-red-500 text-red-600'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stock Status Filter */}
                <div className="mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Availability</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setStockFilter('all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                stockFilter === 'all'
                                    ? 'bg-green-50 border-green-500 text-green-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-500'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStockFilter('in-stock')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                stockFilter === 'in-stock'
                                    ? 'bg-green-50 border-green-500 text-green-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-500'
                            }`}
                        >
                            In Stock
                        </button>
                        <button
                            onClick={() => setStockFilter('out-of-stock')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                stockFilter === 'out-of-stock'
                                    ? 'bg-red-50 border-red-500 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                            }`}
                        >
                            Out of Stock
                        </button>
                    </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Price Range</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setPriceRange('all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                priceRange === 'all'
                                    ? 'bg-red-50 border-red-500 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                            }`}
                        >
                            All Prices
                        </button>
                        <button
                            onClick={() => setPriceRange('under-500')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                priceRange === 'under-500'
                                    ? 'bg-red-50 border-red-500 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                            }`}
                        >
                            Under $500
                        </button>
                        <button
                            onClick={() => setPriceRange('500-1000')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                priceRange === '500-1000'
                                    ? 'bg-red-50 border-red-500 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                            }`}
                        >
                            $500 - $1,000
                        </button>
                        <button
                            onClick={() => setPriceRange('1000-2000')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                priceRange === '1000-2000'
                                    ? 'bg-red-50 border-red-500 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                            }`}
                        >
                            $1,000 - $2,000
                        </button>
                        <button
                            onClick={() => setPriceRange('over-2000')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                priceRange === 'over-2000'
                                    ? 'bg-red-50 border-red-500 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
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
