import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProductById, getProducts, toggleWishlist } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { user, openAuthModal } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [cartSuccessFeedback, setCartSuccessFeedback] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  // Fetch product and related products
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchDetails = async () => {
      try {
        const data = await getProductById(id);
        if (isMounted) {
          const item = data?.product || data;
          if (item?._id) {
            setProduct(item);
            setSelectedImage(item.image);

            // Fetch related items from same category
            if (item.category) {
              const relData = await getProducts({ category: item.category });
              if (isMounted && relData.success && Array.isArray(relData.products)) {
                setRelatedProducts(
                  relData.products.filter((p) => p._id !== item._id).slice(0, 4)
                );
              }
            }
          } else {
            setError("Product not found.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load product details:", err);
          setError("Product could not be retrieved.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Wishlist state check
  const handleWishlistToggle = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (wishlistLoading || !product) return;

    setWishlistLoading(true);
    try {
      const response = await toggleWishlist(product._id);
      if (response && response.success) {
        setIsWishlisted(Boolean(response.saved));
        window.dispatchEvent(new Event("wishlist-updated"));
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Add to Bag action
  const handleAddToCart = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (isAdding || !product || isOutOfStock || isMaxInCart) return;

    setIsAdding(true);
    try {
      const result = await addToCart(product._id);
      if (result.success) {
        setCartSuccessFeedback("Added to your shopping bag");
        setTimeout(() => setCartSuccessFeedback(""), 2500);
      }
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const inCartQty = product
    ? cartItems.find((item) => (item.product?._id || item.product) === product._id)?.quantity || 0
    : 0;

  const isOutOfStock = product ? product.stock <= 0 : false;
  const isMaxInCart = product ? inCartQty >= product.stock && product.stock > 0 : false;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square rounded-3xl bg-[#E8E6E0]" />
            <div className="space-y-6">
              <div className="h-6 w-1/4 rounded-sm bg-[#E8E6E0]" />
              <div className="h-10 w-3/4 rounded-sm bg-[#E8E6E0]" />
              <div className="h-6 w-1/3 rounded-sm bg-[#E8E6E0]" />
              <div className="h-24 w-full rounded-sm bg-[#E8E6E0]" />
              <div className="h-12 w-full rounded-xl bg-[#E8E6E0]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto max-w-md w-full px-4 py-20 text-center">
          <div className="rounded-3xl glass-panel p-10 border border-red-200">
            <h2 className="font-serif-editorial text-2xl font-bold text-[#191919]">Artifact Not Found</h2>
            <p className="mt-2 text-xs text-[#73736E]">The requested piece may have been retired from our catalog.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-[#E87924] px-6 py-2.5 text-xs font-semibold text-white"
            >
              Back to Catalog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-[#73736E]">
          <Link to="/" className="hover:text-[#191919] transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#191919] transition">Catalog</Link>
          <span>/</span>
          <Link
            to={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#191919] transition"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="font-medium text-[#191919] truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl glass-card bg-[#F2EFE9] shadow-md">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-all duration-500"
              />
              {/* Category pill */}
              <div className="absolute left-4 top-4">
                <span className="glass-badge rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#191919]">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Thumbnail selector (using main image + subtle variations) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedImage(product.image)}
                className={`relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition ${
                  selectedImage === product.image ? "border-[#E87924]" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={product.image} alt="Thumbnail 1" className="h-full w-full object-cover" />
              </button>
            </div>
          </div>

          {/* Right Column: Information & Controls */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E87924]">
              Authentic Edition
            </span>
            <h1 className="mt-2 font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#191919]">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191919]">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-[#73736E]">Inclusive of all taxes & duty</span>
            </div>

            {/* Stock indicator badge */}
            <div className="mt-4 flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  Currently Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  In Stock ({product.stock} units available)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-[#E8E6E0] pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
                Product Description
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#73736E]">
                {product.description}
              </p>
            </div>

            {/* Specs & Material Details */}
            <div className="mt-6 border-t border-[#E8E6E0] pt-6 grid grid-cols-2 gap-4 text-xs text-[#73736E]">
              <div>
                <span className="block font-medium text-[#191919]">Material</span>
                <span className="mt-0.5 block">Premium Artisanal Grade</span>
              </div>
              <div>
                <span className="block font-medium text-[#191919]">Warranty</span>
                <span className="mt-0.5 block">2-Year Full Replacement</span>
              </div>
              <div>
                <span className="block font-medium text-[#191919]">Dispatch</span>
                <span className="mt-0.5 block">Next-day Tracked Courier</span>
              </div>
              <div>
                <span className="block font-medium text-[#191919]">Origin</span>
                <span className="mt-0.5 block">Direct Maker Partnership</span>
              </div>
            </div>

            {/* Success Feedback banner */}
            {cartSuccessFeedback && (
              <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800 animate-fade-in">
                ✓ {cartSuccessFeedback}
              </div>
            )}

            {/* Purchasing Action Group */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock || isMaxInCart}
                className="flex-1 rounded-xl bg-[#E87924] py-3.5 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D4691B] active:scale-[0.99] disabled:opacity-50"
              >
                {isAdding
                  ? "Adding to Bag..."
                  : isOutOfStock
                  ? "Sold Out"
                  : isMaxInCart
                  ? `Max in Bag (${inCartQty})`
                  : inCartQty > 0
                  ? `Add Another to Bag (${inCartQty} in Bag)`
                  : "Add to Shopping Bag"}
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`flex items-center justify-center rounded-xl border border-[#E8E6E0] p-3.5 transition hover:border-[#D5D2C9] ${
                  isWishlisted ? "bg-[#191919] text-white" : "bg-white text-[#191919] hover:bg-[#F2EFE9]"
                }`}
                aria-label="Wishlist"
              >
                <svg className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* --- RELATED ARTIFACTS SECTION --- */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-[#E8E6E0] pt-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#E87924]">
                  Complementary Selection
                </span>
                <h2 className="mt-1 font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191919]">
                  More from {product.category}
                </h2>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-semibold text-[#E87924] hover:underline"
              >
                View all in category →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
