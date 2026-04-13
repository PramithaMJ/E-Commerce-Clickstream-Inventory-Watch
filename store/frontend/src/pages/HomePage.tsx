import React, { useCallback, useEffect, useState } from 'react';
import { FiShoppingCart, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import CartModal from '../components/CartModal';
import TopBar from '../components/TopBar';
import { useCart } from '../hooks/useCart';
import { useSession } from '../hooks/useSession';
import { usePreferences } from '../context/PreferencesContext';
import { productService } from '../services/productService';
import { trackingService } from '../services/trackingService';
import { Product } from '../types';

// ─── Category nav ────────────────────────────────────────────────────────────
const categories = [
    { value: 'all',          label: 'All',         icon: '🏠' },
    { value: 'smartphones',  label: 'Phones',       icon: '📱' },
    { value: 'laptops',      label: 'Laptops',      icon: '💻' },
    { value: 'tablets',      label: 'Tablets',      icon: '📲' },
    { value: 'audio',        label: 'Audio',        icon: '🎧' },
    { value: 'gaming',       label: 'Gaming',       icon: '🎮' },
    { value: 'accessories',  label: 'Accessories',  icon: '⌚' },
];

// ─── Filter options ───────────────────────────────────────────────────────────
type StockFilter  = 'all' | 'in-stock' | 'out-of-stock';
type PriceRange   = 'all' | 'under-500' | '500-1000' | '1000-2000' | 'over-2000';
type SortOption   = 'default' | 'price-asc' | 'price-desc' | 'rating';

// Helper to generate price options based on currency
const generatePriceOptions = (formatPrice: (price: number) => string): { value: PriceRange; label: string }[] => {
    return [
        { value: 'all', label: 'All Prices' },
        { value: 'under-500', label: `Under ${formatPrice(500)}` },
        { value: '500-1000', label: `${formatPrice(500)}–${formatPrice(1000)}` },
        { value: '1000-2000', label: `${formatPrice(1000)}–${formatPrice(2000)}` },
        { value: 'over-2000', label: `Over ${formatPrice(2000)}` },
    ];
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white rounded overflow-hidden border border-gray-100 animate-pulse">
        <div className="h-44 bg-gray-200" />
        <div className="p-2.5 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
    </div>
);

// ─── Banner slides ─────────────────────────────────────────────────────────────
const banners = [
    { bg: 'from-red-500 to-orange-500', emoji: '📱', title: 'New Arrivals',      sub: 'Latest smartphones at unbeatable prices' },
    { bg: 'from-blue-500 to-indigo-600', emoji: '💻', title: 'Laptop Deals',     sub: 'Pro-grade laptops, budget-friendly prices' },
    { bg: 'from-purple-500 to-pink-500', emoji: '🎧', title: 'Audio Sale',       sub: 'Premium sound, massive discounts' },
    { bg: 'from-green-500 to-teal-500',  emoji: '🎮', title: 'Gaming Week',      sub: 'Level up your setup today' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
    const [products, setProducts]               = useState<Product[]>([]);
    const [filtered, setFiltered]               = useState<Product[]>([]);
    const [loading, setLoading]                 = useState(true);
    const [category, setCategory]               = useState('all');
    const [searchInput, setSearchInput]         = useState('');
    const [searchQuery, setSearchQuery]         = useState('');
    const [stockFilter, setStockFilter]         = useState<StockFilter>('all');
    const [priceRange, setPriceRange]           = useState<PriceRange>('all');
    const [sortBy, setSortBy]                   = useState<SortOption>('default');
    const [isCartOpen, setIsCartOpen]           = useState(false);
    const [bannerIdx, setBannerIdx]             = useState(0);

    const { userId, sessionId } = useSession();
    const cart = useCart();
    const { formatPrice } = usePreferences();

    // Generate price options based on current currency
    const priceOptions = generatePriceOptions(formatPrice);

    // Load products
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setProducts(await productService.getAll());
            } catch {
                toast.error('Failed to load products. Please try again.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Auto-rotate banner
    useEffect(() => {
        const id = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4000);
        return () => clearInterval(id);
    }, []);

    // Filter + sort whenever deps change
    useEffect(() => {
        let list = [...products];

        if (category !== 'all')         list = list.filter(p => p.category === category);
        if (stockFilter === 'in-stock') list = list.filter(p => p.inStock);
        if (stockFilter === 'out-of-stock') list = list.filter(p => !p.inStock);

        if (priceRange === 'under-500')  list = list.filter(p => p.price < 500);
        if (priceRange === '500-1000')   list = list.filter(p => p.price >= 500  && p.price < 1000);
        if (priceRange === '1000-2000')  list = list.filter(p => p.price >= 1000 && p.price < 2000);
        if (priceRange === 'over-2000')  list = list.filter(p => p.price >= 2000);

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );
        }

        if (sortBy === 'price-asc')  list.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating')     list.sort((a, b) => b.rating - a.rating);

        setFiltered(list);
    }, [products, category, stockFilter, priceRange, searchQuery, sortBy]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        if (searchInput) trackingService.trackSearch(searchInput);
    };

    const handleAddToCart = (product: Product) => {
        cart.addToCart({ product, quantity: 1 });
        trackingService.trackAddToCart(product.id, product.name, product.category, product.price, 1);
        toast.success(`Added to cart!`, { duration: 2000 });
    };

    const handleView = useCallback((product: Product) => {
        trackingService.trackView(product.id, product.name, product.category, product.price);
    }, []);

    const clearAll = () => {
        setCategory('all');
        setStockFilter('all');
        setPriceRange('all');
        setSortBy('default');
        setSearchQuery('');
        setSearchInput('');
    };

    const hasFilters = category !== 'all' || stockFilter !== 'all' || priceRange !== 'all' || searchQuery;
    const banner = banners[bannerIdx];

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            <TopBar />

            {/* ── Sticky header ── */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-4">
                    {/* Logo + search + cart */}
                    <div className="flex items-center gap-4 py-3">
                        {/* Logo */}
                        <div className="shrink-0 flex items-end gap-0.5">
                            <span className="text-2xl font-black text-red-500 leading-none tracking-tight">Electro</span>
                            <span className="text-[10px] text-gray-400 mb-0.5">store</span>
                        </div>

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="flex flex-1 max-w-3xl mx-auto">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                placeholder="Search products, brands and categories…"
                                className="flex-1 px-4 py-2.5 text-sm border-2 border-red-500 border-r-0 rounded-l-sm outline-none focus:border-red-600 bg-white min-w-0"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2 rounded-r-sm font-semibold text-sm shrink-0"
                            >
                                <FiSearch className="w-4 h-4" />
                                <span className="hidden sm:block">Search</span>
                            </button>
                        </form>

                        {/* Cart button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded hover:border-red-400 hover:text-red-500 transition-colors shrink-0 text-gray-600"
                        >
                            <FiShoppingCart className="w-5 h-5" />
                            <span className="hidden sm:block text-sm font-medium">Cart</span>
                            {cart.getTotalItems() > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                                    {cart.getTotalItems() > 99 ? '99+' : cart.getTotalItems()}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Category nav */}
                    <nav className="flex overflow-x-auto border-t border-gray-100 -mx-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                                    category === cat.value
                                        ? 'border-red-500 text-red-500'
                                        : 'border-transparent text-gray-600 hover:text-red-500 hover:border-red-200'
                                }`}
                            >
                                <span className="text-base">{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* ── Filter bar ── */}
            <div className="bg-white border-b border-gray-200 sticky top-[105px] z-30 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-x-3 gap-y-2 flex-wrap">
                    {/* Availability */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 font-medium">Stock:</span>
                        {(['all', 'in-stock', 'out-of-stock'] as StockFilter[]).map(opt => (
                            <button
                                key={opt}
                                onClick={() => setStockFilter(opt)}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                                    stockFilter === opt
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {opt === 'all' ? 'All' : opt === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                            </button>
                        ))}
                    </div>

                    <div className="h-4 w-px bg-gray-200 hidden sm:block" />

                    {/* Price range */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 font-medium">Price:</span>
                        {priceOptions.map(pr => (
                            <button
                                key={pr.value}
                                onClick={() => setPriceRange(pr.value)}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                                    priceRange === pr.value
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {pr.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-4 w-px bg-gray-200 hidden sm:block" />

                    {/* Sort */}
                    <div className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-400 font-medium">Sort:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value as SortOption)}
                                className="appearance-none text-[11px] border border-gray-200 rounded px-2.5 py-1 pr-6 outline-none focus:border-red-400 bg-white text-gray-700 cursor-pointer"
                            >
                                <option value="default">Best Match</option>
                                <option value="price-asc">Price: Low → High</option>
                                <option value="price-desc">Price: High → Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                            <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Clear + count */}
                    <div className="ml-auto flex items-center gap-3">
                        {hasFilters && (
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 font-medium"
                            >
                                <FiX className="w-3 h-3" /> Clear all
                            </button>
                        )}
                        <span className="text-[11px] text-gray-400">
                            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Page body ── */}
            <main className="max-w-[1400px] mx-auto px-4 py-5">

                {/* Promotional banner */}
                {!searchQuery && category === 'all' && (
                    <div className={`relative rounded-xl overflow-hidden mb-6 bg-gradient-to-r ${banner.bg} text-white p-8 flex items-center justify-between`}>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Featured</p>
                            <h2 className="text-3xl font-black mb-1">{banner.title}</h2>
                            <p className="text-sm opacity-90 mb-4">{banner.sub}</p>
                            <button className="px-5 py-2 bg-white text-red-500 font-bold text-sm rounded hover:bg-gray-100 transition-colors">
                                Shop Now →
                            </button>
                        </div>
                        <span className="text-8xl opacity-30 select-none hidden sm:block">{banner.emoji}</span>

                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {banners.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setBannerIdx(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === bannerIdx ? 'bg-white w-4' : 'bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Active filter chips */}
                {hasFilters && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {searchQuery && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 text-xs rounded-full">
                                Search: "{searchQuery}"
                                <button onClick={() => { setSearchQuery(''); setSearchInput(''); }}>
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {category !== 'all' && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 text-xs rounded-full">
                                {categories.find(c => c.value === category)?.icon} {categories.find(c => c.value === category)?.label}
                                <button onClick={() => setCategory('all')}><FiX className="w-3 h-3" /></button>
                            </span>
                        )}
                        {stockFilter !== 'all' && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 text-xs rounded-full">
                                {stockFilter === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                                <button onClick={() => setStockFilter('all')}><FiX className="w-3 h-3" /></button>
                            </span>
                        )}
                        {priceRange !== 'all' && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 text-xs rounded-full">
                                {priceOptions.find(p => p.value === priceRange)?.label}
                                <button onClick={() => setPriceRange('all')}><FiX className="w-3 h-3" /></button>
                            </span>
                        )}
                    </div>
                )}

                {/* Products grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <span className="text-7xl mb-4">🔍</span>
                        <p className="font-semibold text-gray-500 text-lg">No products found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search</p>
                        {hasFilters && (
                            <button onClick={clearAll} className="mt-4 px-6 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors">
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {filtered.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onView={handleView}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Footer ── */}
            <footer className="bg-white border-t border-gray-200 mt-8">
                <div className="max-w-[1400px] mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6 text-sm">
                        <div>
                            <p className="font-bold text-gray-800 mb-2">Buyer Protection</p>
                            <ul className="space-y-1 text-gray-500 text-xs">
                                <li>Safe & secure payments</li>
                                <li>Easy returns</li>
                                <li>Money-back guarantee</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 mb-2">Help Center</p>
                            <ul className="space-y-1 text-gray-500 text-xs">
                                <li>Track my order</li>
                                <li>Contact us</li>
                                <li>Report a problem</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 mb-2">Categories</p>
                            <ul className="space-y-1 text-gray-500 text-xs">
                                {categories.filter(c => c.value !== 'all').map(c => (
                                    <li key={c.value} className="cursor-pointer hover:text-red-500" onClick={() => setCategory(c.value)}>
                                        {c.icon} {c.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 mb-2">Analytics</p>
                            <ul className="space-y-1 text-gray-500 text-xs">
                                <li>Real-time clickstream</li>
                                <li>Kafka event streaming</li>
                                <li>Spark processing</li>
                                <li>Airflow orchestration</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <span className="text-red-500 font-black text-base">Electro</span>
                            <span>© 2026 All Rights Reserved</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="hover:text-red-500 cursor-pointer">Privacy Policy</span>
                            <span className="hover:text-red-500 cursor-pointer">Terms of Service</span>
                            <span className="hover:text-red-500 cursor-pointer">Sitemap</span>
                        </div>
                        <span className="text-gray-300 text-[10px]">
                            Session: {sessionId?.substring(0, 8)} | User: {userId?.substring(0, 12)}
                        </span>
                    </div>
                </div>
            </footer>

            <CartModal
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                userId={userId}
                sessionId={sessionId}
            />
        </div>
    );
};

export default HomePage;
