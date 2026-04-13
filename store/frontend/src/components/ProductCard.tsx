import React, { useEffect, useRef } from 'react';
import { Product } from '../types';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { usePreferences } from '../context/PreferencesContext';

interface ProductCardProps {
    product: Product;
    onView: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

// Emoji icons for categories
const categoryIcons: Record<string, string> = {
    smartphones: '📱',
    laptops: '💻',
    tablets: '📲',
    gaming: '🎮',
    audio: '🎧',
    accessories: '⌚',
};

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onView,
    onAddToCart
}) => {
    const { formatPrice } = usePreferences();
    const hasViewed = useRef(false);

    useEffect(() => {
        // Track view only once when component mounts
        if (!hasViewed.current) {
            onView(product);
            hasViewed.current = true;
        }
    }, [product, onView]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(product);
    };

    return (
        <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Product Image */}
            <div className="relative h-48 bg-gray-50 flex items-center justify-center">
                <span className="text-6xl">{categoryIcons[product.category] || '📦'}</span>
                <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    {product.category}
                </div>
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-red-500 transition-colors">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2 h-10">
                    {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                    <FiStar className="text-yellow-400 fill-yellow-400 w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                    <span className="text-xs text-gray-400">({product.stock} in stock)</span>
                </div>

                {/* Features */}
                <div className="h-6 mb-4 overflow-hidden">
                    {product.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="inline-block text-xs bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded mr-1">
                            {feature}
                        </span>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        <div className="text-2xl font-extrabold text-red-500">
                            {formatPrice(product.price)}
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                        <FiShoppingCart />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
