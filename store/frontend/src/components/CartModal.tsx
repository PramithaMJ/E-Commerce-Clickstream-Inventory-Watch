import React from 'react';
import { FiX, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { trackingService } from '../services/trackingService';
import { useCart } from '../hooks/useCart';
import { usePreferences } from '../context/PreferencesContext';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: ReturnType<typeof useCart>;
    userId: string;
    sessionId: string;
}

const categoryIcons: Record<string, string> = {
    smartphones: '📱',
    laptops: '💻',
    tablets: '📲',
    gaming: '🎮',
    audio: '🎧',
    accessories: '⌚',
};

export const CartModal: React.FC<CartModalProps> = ({
    isOpen,
    onClose,
    cart,
    userId,
    sessionId,
}) => {
    const { formatPrice } = usePreferences();
    if (!isOpen) return null;

    const handleRemove = (productId: string) => {
        const item = cart.cartItems.find(i => i.product.id === productId);
        if (item && userId && sessionId) {
            trackingService.trackRemoveFromCart(
                item.product.id,
                item.product.name,
                item.product.category
            );
        }
        cart.removeFromCart(productId);
        toast.success('Item removed from cart');
    };

    const handleCheckout = async () => {
        if (cart.cartItems.length === 0) return;

        // Track purchases for all items
        if (userId && sessionId) {
            for (const item of cart.cartItems) {
                await trackingService.trackPurchase(
                    item.product.id,
                    item.product.name,
                    item.product.category,
                    item.product.price,
                    item.quantity
                );
            }
        }

        cart.clearCart();
        onClose();
        toast.success('Purchase completed! Thank you for your order! 🎉', {
            duration: 4000,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                            <FiShoppingBag className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">Shopping Cart</h2>
                            <p className="text-sm text-gray-500">{cart.getTotalItems()} items</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <FiShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
                            <p className="text-xl text-gray-500 mb-2">Your cart is empty</p>
                            <p className="text-sm text-gray-400">Add some products to get started!</p>
                        </div>
                    ) : (
                        cart.cartItems.map((item) => (
                            <div key={item.product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-red-300 transition-colors">
                                <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-3xl flex-shrink-0">
                                    {categoryIcons[item.product.category] || '📦'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-gray-900 font-semibold truncate">{item.product.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatPrice(item.product.price)} × {item.quantity}
                                    </p>
                                    <p className="text-lg font-bold text-red-500 mt-1">
                                        {formatPrice(item.product.price * item.quantity)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemove(item.product.id)}
                                    className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.cartItems.length > 0 && (
                    <div className="p-6 border-t border-gray-200 space-y-4 bg-gray-50 rounded-b-2xl">
                        <div className="flex items-center justify-between text-lg">
                            <span className="text-gray-600 font-medium">Subtotal</span>
                            <span className="text-2xl font-extrabold text-gray-900">
                                {formatPrice(cart.getTotalPrice())}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            Complete Purchase
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;
