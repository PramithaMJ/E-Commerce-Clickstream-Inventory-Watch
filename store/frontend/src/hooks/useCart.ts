import { useCallback, useEffect, useState } from 'react';
import { CartItem } from '../types';

/**
 * Custom hook for managing shopping cart state.
 * 
 * Persists cart data in localStorage.
 */
export const useCart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    const saveCart = useCallback((items: CartItem[]) => {
        setCartItems(items);
        localStorage.setItem('cart', JSON.stringify(items));
    }, []);

    const addToCart = useCallback((item: CartItem) => {
        setCartItems((prev) => {
            const existingItem = prev.find((i) => i.product.id === item.product.id);
            if (existingItem) {
                const updated = prev.map((i) =>
                    i.product.id === item.product.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
                saveCart(updated);
                return updated;
            } else {
                const updated = [...prev, item];
                saveCart(updated);
                return updated;
            }
        });
    }, [saveCart]);

    const removeFromCart = useCallback((productId: string) => {
        setCartItems((prev) => {
            const updated = prev.filter((i) => i.product.id !== productId);
            saveCart(updated);
            return updated;
        });
    }, [saveCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        localStorage.removeItem('cart');
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        setCartItems((prev) => {
            const updated = prev.map((i) =>
                i.product.id === productId ? { ...i, quantity } : i
            );
            saveCart(updated);
            return updated;
        });
    }, [saveCart]);

    const getTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }, [cartItems]);

    const getTotalItems = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    return {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getTotalPrice,
        getTotalItems,
    };
};
