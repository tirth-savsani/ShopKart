import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

// Dynamically load Razorpay standard checkout SDK script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, totalUnits, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Shipping form state
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phoneNo || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState("");

  // Sync user details if loaded asynchronously
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || user.phoneNo || "",
      }));
    }
  }, [user]);

  // If cart is empty, redirect user back to cart
  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing) {
      navigate("/cart", { replace: true });
    }
  }, [cartItems, isProcessing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-+]/g, ""))) {
      errors.phone = "Phone must be a valid 10-digit number.";
    }
    if (!formData.addressLine1.trim()) errors.addressLine1 = "Address line is required.";
    if (!formData.city.trim()) errors.city = "City is required.";
    if (!formData.state.trim()) errors.state = "State is required.";
    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = "Pincode must contain exactly 6 digits.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setServerError("Failed to load Razorpay payment SDK. Check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // 2. Call backend to validate cart, stock, calculate total, create ShopKart order & Razorpay order
      const orderRes = await createPaymentOrder(formData);

      if (!orderRes.success) {
        setServerError(orderRes.message || "Failed to initialize order.");
        setIsProcessing(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderRes;

      // 3. Configure Razorpay checkout options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "ShopKart",
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // 4. Send payment signatures to backend for HMAC verification
            const verifyRes = await verifyPayment({
              shopKartOrderId: shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              // 5. Instantly clear frontend global cart state and navigate to Order Confirmation
              clearCart();
              window.dispatchEvent(new Event("cart-updated"));
              navigate(`/order-success/${shopKartOrderId}`, {
                replace: true,
                state: { order: verifyRes.order },
              });
            } else {
              setServerError(verifyRes.message || "Payment verification failed.");
              setIsProcessing(false);
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setServerError(
              verifyErr.response?.data?.message ||
                "Payment verification failed. Please contact customer care."
            );
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email || "",
        },
        theme: {
          color: "#E87924",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setServerError("Payment was cancelled or closed. Your cart remains intact.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        setServerError(
          `Payment failed: ${response.error?.description || "Transaction declined."} Your cart is preserved.`
        );
        setIsProcessing(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error("Checkout submission error:", err);
      setServerError(
        err.response?.data?.message ||
          "An error occurred while creating your order. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const isFreeShipping = subtotal >= 999;
  const shippingFee = isFreeShipping ? 0 : 99;
  const estimatedTotal = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#73736E]">
          <Link to="/" className="hover:text-[#191919] transition">Home</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-[#191919] transition">Shopping Bag</Link>
          <span>/</span>
          <span className="font-semibold text-[#191919]">Checkout</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E87924]">
            Secure Order Finalization
          </span>
          <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#191919]">
            Checkout
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#73736E]">
            Provide delivery information and complete payment via Razorpay Test Gateway.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-medium text-red-800 animate-slide-up flex items-start gap-3">
            <svg className="h-5 w-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">{serverError}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Shipping Address Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl glass-panel p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 pb-6 border-b border-[#E8E6E0]">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E87924] text-xs font-bold text-white">
                  1
                </span>
                <div>
                  <h2 className="font-serif-editorial text-xl font-bold text-[#191919]">
                    Shipping Details
                  </h2>
                  <p className="text-xs text-[#73736E]">
                    Where should we deliver your handcrafted items?
                  </p>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Aarav Sharma"
                      className={`mt-1 w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-xs sm:text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:bg-white focus:ring-1 focus:ring-[#E87924] ${
                        formErrors.fullName
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#E8E6E0] focus:border-[#E87924]"
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-[11px] text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={`mt-1 w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-xs sm:text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:bg-white focus:ring-1 focus:ring-[#E87924] ${
                        formErrors.phone
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#E8E6E0] focus:border-[#E87924]"
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-[11px] text-red-600">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="22 MG Road, Floor 4, Suite 102"
                    className={`mt-1 w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-xs sm:text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:bg-white focus:ring-1 focus:ring-[#E87924] ${
                      formErrors.addressLine1
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#E8E6E0] focus:border-[#E87924]"
                    }`}
                  />
                  {formErrors.addressLine1 && (
                    <p className="mt-1 text-[11px] text-red-600">{formErrors.addressLine1}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Bengaluru"
                      className={`mt-1 w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-xs sm:text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:bg-white focus:ring-1 focus:ring-[#E87924] ${
                        formErrors.city
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#E8E6E0] focus:border-[#E87924]"
                      }`}
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-[11px] text-red-600">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Karnataka"
                      className={`mt-1 w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-xs sm:text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:bg-white focus:ring-1 focus:ring-[#E87924] ${
                        formErrors.state
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#E8E6E0] focus:border-[#E87924]"
                      }`}
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-[11px] text-red-600">{formErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                      Pincode (6 digits) *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="560001"
                      className={`mt-1 w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-xs sm:text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:bg-white focus:ring-1 focus:ring-[#E87924] ${
                        formErrors.pincode
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#E8E6E0] focus:border-[#E87924]"
                      }`}
                    />
                    {formErrors.pincode && (
                      <p className="mt-1 text-[11px] text-red-600">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="rounded-2xl border border-[#E8E6E0] bg-[#F2EFE9]/60 p-4 text-xs text-[#73736E]">
                    <div className="flex items-center gap-2 font-semibold text-[#191919] mb-1">
                      <span>💳</span>
                      <span>Razorpay Test Mode Gateway</span>
                    </div>
                    <p>
                      Clicking "Proceed to Payment" will initialize a secure test transaction.
                      No real currency will be charged.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-[#E87924] py-3.5 text-xs uppercase tracking-widest font-bold text-white shadow-sm transition hover:bg-[#D4691B] active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Connecting to Razorpay...
                    </span>
                  ) : (
                    `Proceed to Payment (${formatPrice(estimatedTotal)})`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Final Order Summary */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl glass-panel p-6 sm:p-7 shadow-lg sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E0]">
                <h3 className="font-serif-editorial text-xl font-bold text-[#191919]">
                  Order Items ({totalUnits})
                </h3>
                <Link to="/cart" className="text-xs text-[#E87924] font-medium hover:underline">
                  Edit Bag
                </Link>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#E8E6E0] max-h-80 overflow-y-auto pr-1 my-4">
                {cartItems.map((item) => (
                  <div key={item.product?._id || item._id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover bg-[#F2EFE9] border border-[#E8E6E0]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif-editorial text-xs sm:text-sm font-semibold text-[#191919] truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-[11px] text-[#73736E] mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.product?.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif-editorial text-xs sm:text-sm font-bold text-[#191919]">
                        {formatPrice(Number(item.product?.price || 0) * Number(item.quantity || 0))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-3 text-xs border-t border-[#E8E6E0] pt-4">
                <div className="flex justify-between text-[#73736E]">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-[#191919]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#73736E]">
                  <span>Shipping Fee</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="font-semibold text-emerald-700">Complimentary</span>
                    ) : (
                      <span className="font-semibold text-[#191919]">{formatPrice(shippingFee)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[#73736E]">
                  <span>Applicable Tax (18% GST)</span>
                  <span className="font-medium text-[#191919]">Included in price</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="mt-4 border-t border-[#E8E6E0] pt-4 flex items-baseline justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-[#191919]">
                  Total Due
                </span>
                <span className="font-serif-editorial text-2xl font-bold text-[#191919]">
                  {formatPrice(estimatedTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
