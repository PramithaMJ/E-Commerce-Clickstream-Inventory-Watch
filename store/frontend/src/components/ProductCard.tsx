import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../types';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { usePreferences } from '../context/PreferencesContext';

interface ProductCardProps {
    product: Product;
    onView: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

// Simulated sold counts per category
const soldCounts: Record<string, string> = {
    smartphones: '2.3k+ sold',
    laptops: '1.8k+ sold',
    tablets: '1.2k+ sold',
    gaming: '3.4k+ sold',
    audio: '4.5k+ sold',
    accessories: '8.9k+ sold',
};

// Simulated discount percentages per product
const discountMap: Record<string, number> = {
    PROD_001: 15, PROD_002: 12, PROD_003: 20,
    PROD_004: 8,  PROD_005: 18, PROD_006: 10,
    PROD_007: 14, PROD_008: 22, PROD_009: 25,
    PROD_010: 16, PROD_011: 12, PROD_012: 5,
    PROD_013: 7,  PROD_014: 10, PROD_015: 30,
    PROD_016: 28, PROD_017: 35, PROD_018: 20,
};

// Fallback emoji per category
const categoryEmoji: Record<string, string> = {
    smartphones: '📱', laptops: '💻', tablets: '📲',
    gaming: '🎮', audio: '🎧', accessories: '⌚',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onView, onAddToCart }) => {
    const { formatPrice } = usePreferences();
    const hasViewed = useRef(false);
    const [imgError, setImgError] = useState(false);

    const discount = discountMap[product.id] ?? 10;
    const originalPrice = product.price * (1 + discount / 100);

    useEffect(() => {
        if (!hasViewed.current) {
            onView(product);
            hasViewed.current = true;
        }
    }, [product, onView]);

    return (
        <div className="group bg-white rounded overflow-hidden border border-gray-200 hover:shadow-lg hover:border-red-400 transition-all duration-200 relative flex flex-col cursor-pointer">
            {/* Discount badge */}
            {discount > 0 && (
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    -{discount}%
                </div>
            )}

            {/* Wishlist */}
            <button className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 text-gray-400">
                <FiHeart className="w-3.5 h-3.5" />
            </button>

            {/* Product image */}
            <div className="relative h-44 bg-gray-50 overflow-hidden flex items-center justify-center">
                {product.imageUrl && !imgError ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span className="text-5xl">{categoryEmoji[product.category] ?? '📦'}</span>
                )}
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-2.5 flex flex-col flex-1">
                {/* Price row */}
                <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-red-500 font-bold text-base leading-none">
                        {formatPrice(product.price)}
                    </span>
                    <span className="text-gray-400 text-xs line-through leading-none">
                        {formatPrice(originalPrice)}
                    </span>
                </div>

                {/* Name */}
                <p className="text-gray-700 text-xs leading-snug line-clamp-2 mb-2 flex-1">
                    {product.name}
                </p>

                {/* Stars + sold */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <svg key={i} className={`w-2.5 h-2.5 ${i <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-200'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                        <span className="ml-0.5">{product.rating}</span>
                    </div>
                    <span>{soldCounts[product.category] ?? '1k+ sold'}</span>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-green-600 font-medium">Free Shipping</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        disabled={!product.inStock}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <FiShoppingCart className="w-3 h-3" />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
