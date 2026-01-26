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
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    const { userId, sessionId } = useSession();
    const cart = useCart();

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchQuery]);

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

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

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

            {/* Category Filter */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center space-x-2 mb-2">
                    <FiFilter className="text-gray-400" />
                    <span className="text-sm text-gray-400">Filter by category:</span>
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
