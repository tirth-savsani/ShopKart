import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateCartQuantity, removeFromCart as apiRemoveFromCart } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    if (!user) {
      queueMicrotask(() => {
        if (!ignore) setCartItems([]);
      });
      return;
    }

    const loadCart = async () => {
      try {
        const data = await getCart();
        if (!ignore && data && data.success && Array.isArray(data.cart)) {
          setCartItems(data.cart);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch cart:", err);
          setCartError("Unable to load your cart.");
        }
      } finally {
        if (!ignore) {
          setCartLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      ignore = true;
    };
  }, [user, refreshKey]);

  const refreshCart = () => {
    setCartLoading(true);
    setCartError(null);
    setRefreshKey((k) => k + 1);
  };

  // Add product to cart or increment quantity
  const addToCart = async (productId) => {
    setActionLoadingId(productId);
    try {
      const data = await apiAddToCart(productId);
      if (data && data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
        return { success: true, message: data.message || "Added to cart" };
      }
      return { success: false, message: "Failed to update cart" };
    } catch (err) {
      console.error("Add to cart error:", err);
      const msg = err.response?.data?.message || "Failed to add product to cart.";
      return { success: false, message: msg };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update quantity for a specific product
  const updateQuantity = async (productId, quantity) => {
    setActionLoadingId(productId);
    try {
      const data = await apiUpdateCartQuantity(productId, quantity);
      if (data && data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
        return { success: true };
      }
      return { success: false, message: "Failed to update quantity" };
    } catch (err) {
      console.error("Update quantity error:", err);
      const msg = err.response?.data?.message || "Failed to update quantity.";
      return { success: false, message: msg };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    setActionLoadingId(productId);
    try {
      const data = await apiRemoveFromCart(productId);
      if (data && data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
        return { success: true };
      }
      return { success: false, message: "Failed to remove item" };
    } catch (err) {
      console.error("Remove from cart error:", err);
      const msg = err.response?.data?.message || "Failed to remove item from cart.";
      return { success: false, message: msg };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Derived values calculated from cartItems state (never stored separately)
  const { totalUnits, subtotal } = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.product?.price) || 0;
        acc.totalUnits += qty;
        acc.subtotal += price * qty;
        return acc;
      },
      { totalUnits: 0, subtotal: 0 }
    );
  }, [cartItems]);

  // Instantly clear global cart state (called after confirmed order payment)
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    cartLoading,
    cartError,
    actionLoadingId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    totalUnits,
    cartCount: totalUnits, // Navbar cart count
    subtotal,
    totalItems: cartItems.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
