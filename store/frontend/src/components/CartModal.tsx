import React from 'react';
import { FiX, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { trackingService } from '../services/trackingService';
import { useCart } from '../hooks/useCart';

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
                className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <FiShoppingBag className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
                            <p className="text-sm text-gray-400">{cart.getTotalItems()} items</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <FiX className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <FiShoppingBag className="w-20 h-20 text-gray-600 mb-4" />
                            <p className="text-xl text-gray-400 mb-2">Your cart is empty</p>
                            <p className="text-sm text-gray-500">Add some products to get started!</p>
                        </div>
                    ) : (
                        cart.cartItems.map((item) => (
                            <div key={item.product.id} className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                                    {categoryIcons[item.product.category] || '📦'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold truncate">{item.product.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        ${item.product.price.toLocaleString()} × {item.quantity}
                                    </p>
                                    <p className="text-lg font-bold text-blue-400 mt-1">
                                        ${(item.product.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemove(item.product.id)}
                                    className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.cartItems.length > 0 && (
                    <div className="p-6 border-t border-gray-700 space-y-4">
                        <div className="flex items-center justify-between text-lg">
                            <span className="text-gray-300 font-medium">Subtotal</span>
                            <span className="text-2xl font-bold text-white">
                                ${cart.getTotalPrice().toLocaleString()}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
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
