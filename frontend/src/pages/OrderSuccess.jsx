import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) return;

    let ignore = false;
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        if (!ignore && res.success) {
          setOrder(res.order);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load order confirmation:", err);
          setError("Unable to retrieve order details.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      ignore = true;
    };
  }, [id, order]);

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#191919] border-t-transparent mb-4" />
            <p className="font-serif-editorial text-base text-[#191919]">Loading order confirmation...</p>
          </div>
        ) : error || !order ? (
          <div className="rounded-3xl glass-panel p-10 text-center border border-red-200">
            <h2 className="font-serif-editorial text-2xl font-bold text-[#191919]">Order Not Found</h2>
            <p className="mt-2 text-xs text-[#73736E]">{error || "Could not locate this order."}</p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-[#E87924] px-6 py-2.5 text-xs font-semibold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl glass-panel p-6 sm:p-10 shadow-xl animate-slide-up">
            {/* Top Success Badge */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                Payment Verified & Confirmed
              </span>
              <h1 className="mt-1 font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#191919]">
                Thank you for your order.
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#73736E] max-w-md mx-auto">
                Your payment was authenticated via Razorpay. We have registered your order and begun dispatch preparation.
              </p>
            </div>

            {/* Order Details Strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-[#E8E6E0] bg-white/70 p-4 text-xs">
              <div>
                <span className="text-[#73736E] block text-[10px] uppercase font-bold tracking-wider">Order ID</span>
                <span className="font-semibold text-[#191919] mt-0.5 block truncate" title={order._id}>
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-[#73736E] block text-[10px] uppercase font-bold tracking-wider">Date</span>
                <span className="font-semibold text-[#191919] mt-0.5 block">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-[#73736E] block text-[10px] uppercase font-bold tracking-wider">Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {order.status}
                </span>
              </div>
              <div>
                <span className="text-[#73736E] block text-[10px] uppercase font-bold tracking-wider">Total Paid</span>
                <span className="font-serif-editorial font-bold text-sm text-[#191919] mt-0.5 block">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="mt-8 border-t border-[#E8E6E0] pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191919] mb-4">
                Ordered Artifacts ({order.items.length})
              </h3>
              <div className="divide-y divide-[#E8E6E0]">
                {order.items.map((item) => (
                  <div key={item.product?._id || item._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-xl object-cover bg-[#F2EFE9] border border-[#E8E6E0]"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-serif-editorial text-sm font-semibold text-[#191919] truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#73736E]">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif-editorial text-sm font-bold text-[#191919]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address Summary */}
            {order.shippingAddress && (
              <div className="mt-6 border-t border-[#E8E6E0] pt-6 text-xs text-[#73736E]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#191919] mb-2">
                  Delivery Destination
                </h4>
                <p className="font-semibold text-[#191919]">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p>Contact: {order.shippingAddress.phone}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-[#E8E6E0]">
              <Link
                to="/orders"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#E87924] px-7 py-3 text-xs uppercase tracking-wider font-semibold text-white shadow-sm hover:bg-[#D4691B] transition"
              >
                View All My Orders
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#E8E6E0] bg-white px-6 py-3 text-xs uppercase tracking-wider font-semibold text-[#191919] hover:bg-[#F2EFE9] transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
