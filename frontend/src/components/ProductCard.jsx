import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toggleWishlist } from "../services/api";

export default function ProductCard({ product, initialWishlisted = false }) {
  const { _id, name, price, category, image, stock } = product;
  const { user, openAuthModal } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if product is already in global cart
  const cartItem = cartItems.find(
    (item) => (item.product?._id || item.product) === _id
  );
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = stock <= 0;
  const isMaxInCart = inCartQty >= stock && stock > 0;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal("login");
      return;
    }

    if (wishlistLoading) return;
    setWishlistLoading(true);

    try {
      const response = await toggleWishlist(_id);
      if (response && response.success) {
        setIsWishlisted(Boolean(response.saved));
        window.dispatchEvent(new Event("wishlist-updated"));
      }
    } catch (err) {
      console.error("Wishlist operation failed:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal("login");
      return;
    }

    if (isAddingToCart || isOutOfStock || isMaxInCart) return;

    setIsAddingToCart(true);
    setCartFeedback("");

    try {
      const result = await addToCart(_id);
      if (result.success) {
        setCartFeedback("Added to Bag");
        setTimeout(() => setCartFeedback(""), 2000);
      } else {
        setCartFeedback(result.message || "Failed");
        setTimeout(() => setCartFeedback(""), 2500);
      }
    } catch {
      setCartFeedback("Error");
      setTimeout(() => setCartFeedback(""), 2500);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl glass-card transition-all duration-300">
      {/* Product Image Frame */}
      <Link
        to={`/products/${_id}`}
        className="relative block aspect-4/3 w-full overflow-hidden bg-[#F2EFE9]"
      >
        {/* Skeleton while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-[#E8E6E0]" />
        )}

        <img
          src={image}
          alt={name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
          }}
        />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {category && (
            <span className="glass-badge rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#191919]">
              {category}
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-red-600/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Sold Out
            </span>
          )}
          {!isOutOfStock && stock <= 5 && (
            <span className="rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Only {stock} Left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
            isWishlisted
              ? "bg-[#191919] text-white shadow-md"
              : "glass-badge text-[#191919] hover:bg-white hover:text-red-500"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill={isWishlisted ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.7}
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Quick Add Overlay on Hover (Desktop) */}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
          <button
            onClick={handleAddToCartClick}
            disabled={isAddingToCart || isOutOfStock || isMaxInCart}
            className="w-full rounded-xl bg-white/95 backdrop-blur-md py-2.5 text-xs font-semibold text-[#191919] shadow-lg transition hover:bg-[#191919] hover:text-white disabled:opacity-60"
          >
            {isAddingToCart
              ? "Adding..."
              : cartFeedback
              ? cartFeedback
              : isOutOfStock
              ? "Out of Stock"
              : isMaxInCart
              ? "Max in Cart"
              : "+ Quick Add"}
          </button>
        </div>
      </Link>

      {/* Product Details Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/products/${_id}`} className="group-hover:text-[#E87924]">
          <h3 className="line-clamp-1 font-serif-editorial text-base font-semibold tracking-tight text-[#191919] transition-colors">
            {name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#73736E]">
          {product.description}
        </p>

        {/* Pricing & Mobile Quick Action */}
        <div className="mt-4 flex items-center justify-between border-t border-[#E8E6E0] pt-3">
          <div>
            <span className="text-sm font-semibold tracking-tight text-[#191919]">
              {formatPrice(price)}
            </span>
          </div>

          {/* Mobile Add to Cart button */}
          <button
            onClick={handleAddToCartClick}
            disabled={isAddingToCart || isOutOfStock || isMaxInCart}
            className="sm:hidden flex items-center justify-center rounded-xl bg-[#191919] px-3 py-1.5 text-xs font-medium text-white transition active:scale-95 disabled:opacity-50"
          >
            {isAddingToCart
              ? "..."
              : isOutOfStock
              ? "Sold"
              : isMaxInCart
              ? "Max"
              : "+ Bag"}
          </button>

          {/* Desktop in-cart counter pill */}
          {inCartQty > 0 && (
            <span className="hidden sm:inline-block rounded-full bg-[#E87924]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#E87924]">
              {inCartQty} in Bag
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
