import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist, removeFromWishlist } from "../services/api";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchWishlistData = async () => {
      try {
        const data = await getWishlist();
        if (!ignore) {
          if (data && data.success && Array.isArray(data.wishlist)) {
            setWishlist(data.wishlist);
          } else {
            setWishlist([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load wishlist:", err);
          setError("Something went wrong. We couldn't load your wishlist.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchWishlistData();

    return () => {
      ignore = true;
    };
  }, [retryKey]);

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error("Failed to remove item from wishlist:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#73736E]">
          <Link to="/" className="hover:text-[#191919] transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-[#191919]">Saved Wishlist</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E87924]">
              Personal Curation
            </span>
            <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#191919]">
              Saved Wishlist
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#73736E]">
              Articles and pieces you have reserved for future everyday moments.
            </p>
          </div>

          {!loading && !error && (
            <div className="rounded-full glass-panel px-4 py-1.5 text-xs font-semibold text-[#191919] self-start sm:self-auto">
              <span>{wishlist.length} {wishlist.length === 1 ? "Saved Piece" : "Saved Pieces"}</span>
            </div>
          )}
        </div>

        {/* States */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-4/3 rounded-2xl bg-[#E8E6E0] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-2xl glass-panel p-8 text-center my-12 border border-red-200">
            <h3 className="font-serif-editorial text-lg font-bold text-[#191919]">
              Unable to load your saved pieces
            </h3>
            <p className="mt-2 text-xs text-[#73736E]">
              There was an issue retrieving your wishlist records.
            </p>
            <button
              onClick={() => setLoading(true) || setRetryKey((k) => k + 1)}
              className="mt-5 rounded-xl bg-[#E87924] px-5 py-2.5 text-xs font-semibold text-white shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl glass-panel p-10 text-center my-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EFE9] text-[#73736E]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h2 className="font-serif-editorial text-2xl font-bold text-[#191919]">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-xs text-[#73736E] leading-relaxed">
              Click the heart icon on any product in our catalog to save it for later.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-[#E87924] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#D4691B]"
            >
              Discover Artifacts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((item) => (
              <WishlistCard
                key={item._id}
                product={item}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
