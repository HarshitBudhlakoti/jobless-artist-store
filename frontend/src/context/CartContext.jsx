import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

const CART_STORAGE_KEY = 'jobless-artist-cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        toast.success(`Updated quantity in cart`);
        return updated;
      }
      toast.success(`Added to cart`);
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success('Removed from cart');
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const effectivePrice =
        item.discountPrice != null && item.discountPrice < item.price
          ? item.discountPrice
          : item.price || 0;
      return total + effectivePrice * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [cartItems]);

  const isInCart = useCallback(
    (productId) => cartItems.some((item) => item._id === productId),
    [cartItems]
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
