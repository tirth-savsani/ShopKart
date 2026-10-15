import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyOrders, updateOrderStatus } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyOrders();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Unable to load your order history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusProgress = async (orderId, currentStatus) => {
    const sequence = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) return;

    const nextStatus = sequence[currentIndex + 1];
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error("Status progression error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONFIRMED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PLACED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#73736E]">
          <Link to="/" className="hover:text-[#191919] transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-[#191919]">My Orders</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#E87924]">
              Customer Purchase History
            </span>
            <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#191919]">
              My Orders
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#73736E]">
              Track your confirmed deliveries, snapshot receipts, and Razorpay transactions.
            </p>
          </div>

          {!loading && !error && (
            <div className="rounded-full glass-panel px-4 py-1.5 text-xs font-semibold text-[#191919] self-start sm:self-auto">
              <span>{orders.length} {orders.length === 1 ? "Order Placed" : "Orders Placed"}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl glass-card p-6 animate-pulse">
                <div className="h-6 w-1/3 bg-[#E8E6E0] rounded-sm mb-4" />
                <div className="h-16 w-full bg-[#E8E6E0] rounded-xl mb-4" />
                <div className="h-4 w-1/4 bg-[#E8E6E0] rounded-sm" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto max-w-md rounded-2xl glass-panel p-8 text-center my-12 border border-red-200">
            <h3 className="font-serif-editorial text-lg font-bold text-[#191919]">
              Unable to load your orders
            </h3>
            <p className="mt-2 text-xs text-[#73736E]">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-5 rounded-xl bg-[#E87924] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#D4691B]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="mx-auto max-w-md rounded-3xl glass-panel p-10 text-center my-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2EFE9] text-3xl">
              📦
            </div>
            <h2 className="font-serif-editorial text-2xl font-bold text-[#191919]">
              You haven't placed any orders yet
            </h2>
            <p className="mt-2 text-xs text-[#73736E] leading-relaxed">
              When you complete checkout using Razorpay, your order receipts and delivery updates will appear here.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-[#E87924] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#D4691B] transition"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-3xl glass-card transition"
              >
                {/* Order Header Bar */}
                <div className="bg-[#F2EFE9]/70 px-6 py-4 border-b border-[#E8E6E0] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-[#73736E] block text-[10px] uppercase font-bold tracking-wider">
                        Order Placed
                      </span>
                      <span className="font-semibold text-[#191919]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#73736E] block text-[10px] uppercase font-bold tracking-wider">
                        Total
                      </span>
                      <span className="font-serif-editorial font-bold text-sm text-[#191919]">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#73736E] block text-[10px] uppercase font-bold tracking-wider">
                        Payment Status
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        ✓ {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Progression Control */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    {/* Bonus: Progression Trigger */}
                    {order.status !== "DELIVERED" && (
                      <button
                        onClick={() => handleStatusProgress(order._id, order.status)}
                        disabled={updatingId === order._id}
                        className="rounded-xl border border-[#E8E6E0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#191919] hover:bg-[#F2EFE9] transition disabled:opacity-50"
                        title="Simulate dispatch progression (Bonus feature)"
                      >
                        {updatingId === order._id ? "Updating..." : "Advance Status →"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="p-6">
                  <div className="divide-y divide-[#E8E6E0]">
                    {order.items.map((item) => (
                      <div
                        key={item.product?._id || item._id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 shrink-0 rounded-2xl object-cover bg-[#F2EFE9] border border-[#E8E6E0]"
                            />
                          )}
                          <div>
                            <Link
                              to={`/products/${item.product}`}
                              className="font-serif-editorial text-base font-semibold text-[#191919] hover:text-[#E87924] transition"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs text-[#73736E] mt-0.5">
                              Quantity: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right sm:text-right">
                          <span className="font-serif-editorial text-base font-bold text-[#191919]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Destination Info & Receipt */}
                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-[#E8E6E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#73736E]">
                      <div>
                        <span className="font-semibold text-[#191919]">Delivering to: </span>
                        <span>
                          {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1}, {order.shippingAddress.city} ({order.shippingAddress.pincode})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#9E9D97]">
                        Order Ref: #{order._id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
