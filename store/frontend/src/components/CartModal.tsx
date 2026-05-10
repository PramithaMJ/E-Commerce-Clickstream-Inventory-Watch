import React, { useState } from 'react';
import { FiX, FiTrash2, FiShoppingBag, FiPlus, FiMinus } from 'react-icons/fi';
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

const categoryEmoji: Record<string, string> = {
    smartphones: '📱', laptops: '💻', tablets: '📲',
    gaming: '🎮', audio: '🎧', accessories: '⌚',
};

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cart }) => {
    const { formatPrice } = usePreferences();
    const [checkingOut, setCheckingOut] = useState(false);

    if (!isOpen) return null;

    const handleRemove = (productId: string) => {
        const item = cart.cartItems.find(i => i.product.id === productId);
        if (item) {
            trackingService.trackRemoveFromCart(item.product.id, item.product.name, item.product.category);
        }
        cart.removeFromCart(productId);
        toast.success('Item removed');
    };

    const handleCheckout = async () => {
        if (cart.cartItems.length === 0) return;
        setCheckingOut(true);
        for (const item of cart.cartItems) {
            await trackingService.trackPurchase(
                item.product.id, item.product.name,
                item.product.category, item.product.price, item.quantity
            );
        }
        setCheckingOut(false);
        cart.clearCart();
        onClose();
        toast.success('Order placed successfully! 🎉', { duration: 4000 });
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="flex-1 bg-black/50" onClick={onClose} />

            {/* Drawer */}
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <FiShoppingBag className="text-red-500 w-5 h-5" />
                        <span className="font-bold text-gray-900 text-base">Shopping Cart</span>
                        <span className="text-sm text-gray-400">({cart.getTotalItems()})</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                            <FiShoppingBag className="w-20 h-20 text-gray-200" />
                            <p className="font-semibold text-gray-500">Your cart is empty</p>
                            <p className="text-sm text-center">Browse our products and add items to your cart</p>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cart.cartItems.map((item) => (
                            <div key={item.product.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                {/* Image */}
                                <div className="w-16 h-16 rounded overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center">
                                    {item.product.imageUrl ? (
                                        <img
                                            src={item.product.imageUrl}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span className="text-2xl">{categoryEmoji[item.product.category] ?? '📦'}</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                                        {item.product.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{item.product.category}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        {/* Qty controls */}
                                        <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                                            <button
                                                onClick={() => cart.updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                                className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                                            >
                                                <FiMinus className="w-3 h-3" />
                                            </button>
                                            <span className="px-2.5 py-1 text-xs font-semibold text-gray-700 border-x border-gray-200">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                                                className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                                            >
                                                <FiPlus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className="text-red-500 font-bold text-sm">
                                            {formatPrice(item.product.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>

                                {/* Remove */}
                                <button
                                    onClick={() => handleRemove(item.product.id)}
                                    className="self-start p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.cartItems.length > 0 && (
                    <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-600 text-sm font-medium">Subtotal ({cart.getTotalItems()} items)</span>
                            <span className="text-2xl font-black text-red-500">{formatPrice(cart.getTotalPrice())}</span>
                        </div>
                        <p className="text-xs text-green-600 mb-3">Free shipping on all orders</p>
                        <button
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className="w-full py-3.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded transition-colors text-sm tracking-wide"
                        >
                            {checkingOut ? 'Processing...' : 'Checkout Now →'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full mt-2 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded transition-colors text-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;
