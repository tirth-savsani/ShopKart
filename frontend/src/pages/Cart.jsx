import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cartItems,
    cartLoading,
    cartError,
    refreshCart,
    subtotal,
    totalUnits,
    totalItems,
  } = useCart();

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const freeShippingThreshold = 999;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : 99;
  const grandTotal = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#73736E]">
          <Link to="/" className="hover:text-[#191919] transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-[#191919]">Shopping Bag</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E87924]">
            Order Review
          </span>
          <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#191919]">
            Shopping Bag
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#73736E]">
            Review your selected artifacts before secure checkout.
          </p>
        </div>

        {/* Loading State */}
        {cartLoading && cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#191919] border-t-transparent mb-4" />
            <p className="font-serif-editorial text-base font-semibold text-[#191919]">
              Loading your bag...
            </p>
          </div>
        )}

        {/* Error State */}
        {!cartLoading && cartError && (
          <div className="mx-auto max-w-md rounded-2xl glass-panel p-8 text-center my-12 border border-red-200">
            <h3 className="font-serif-editorial text-lg font-bold text-[#191919]">
              Unable to load your shopping bag
            </h3>
            <p className="mt-2 text-xs text-[#73736E]">
              We encountered an issue retrieving your items. Please try again.
            </p>
            <button
              onClick={refreshCart}
              className="mt-5 inline-flex items-center rounded-xl bg-[#E87924] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#D4691B]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!cartLoading && !cartError && cartItems.length === 0 && (
          <div className="mx-auto max-w-md rounded-3xl glass-panel p-10 text-center my-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2EFE9] text-[#73736E]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.188-.578-1.118-1.243l1.262-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
            <h2 className="font-serif-editorial text-2xl font-bold text-[#191919]">
              Your bag is currently empty
            </h2>
            <p className="mt-2 text-xs text-[#73736E] leading-relaxed">
              Explore our catalogue of 50+ curated products and add something you love.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center rounded-xl bg-[#E87924] px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#D4691B]"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Populated Cart Content */}
        {!cartLoading && !cartError && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E0] text-xs text-[#73736E]">
                <span>Items ({totalUnits} total units)</span>
                <span>Subtotal</span>
              </div>

              {cartItems.map((item) => (
                <CartItem key={item.product?._id || item._id} item={item} />
              ))}
            </div>

            {/* Right Column: Order Summary Glass Card */}
            <div className="lg:col-span-4">
              <div className="rounded-3xl glass-panel p-6 sm:p-7 shadow-lg sticky top-24">
                <h3 className="font-serif-editorial text-xl font-bold text-[#191919]">
                  Order Summary
                </h3>

                <div className="mt-6 space-y-3.5 text-xs border-b border-[#E8E6E0] pb-6">
                  <div className="flex justify-between text-[#73736E]">
                    <span>Items Total ({totalItems} distinct)</span>
                    <span className="font-semibold text-[#191919]">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[#73736E]">
                    <span>Estimated Shipping</span>
                    <span>
                      {isFreeShipping ? (
                        <span className="font-semibold text-emerald-700">Complimentary</span>
                      ) : (
                        <span className="font-semibold text-[#191919]">{formatPrice(shippingCost)}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#73736E]">
                    <span>Estimated Tax (18% GST)</span>
                    <span className="font-medium text-[#191919]">Included in price</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="mt-6 flex items-baseline justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#191919]">
                    Estimated Total
                  </span>
                  <span className="font-serif-editorial text-2xl font-bold text-[#191919]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>

                {/* Checkout Handoff CTA */}
                <Link
                  to="/checkout"
                  className="mt-6 block text-center w-full rounded-xl bg-[#E87924] py-3.5 text-xs uppercase tracking-widest font-bold text-white shadow-sm transition hover:bg-[#D4691B] active:scale-[0.99]"
                >
                  Proceed to Checkout
                </Link>

                <p className="mt-4 text-center text-[10px] text-[#73736E]">
                  🔒 256-bit SSL encrypted checkout. 30-day money back guarantee.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
