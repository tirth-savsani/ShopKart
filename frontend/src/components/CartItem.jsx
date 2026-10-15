import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, actionLoadingId } = useCart();

  if (!product) return null;

  const isUpdating = actionLoadingId === product._id;
  const isMinQuantity = quantity <= 1;
  const isMaxQuantity = quantity >= product.stock;

  const handleDecrease = async () => {
    if (isMinQuantity || isUpdating) return;
    await updateQuantity(product._id, quantity - 1);
  };

  const handleIncrease = async () => {
    if (isMaxQuantity || isUpdating) return;
    await updateQuantity(product._id, quantity + 1);
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    await removeFromCart(product._id);
  };

  const lineTotal = Number(product.price || 0) * Number(quantity || 0);

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl glass-card transition">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Link
          to={`/products/${product._id}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F2EFE9] border border-[#E8E6E0] group"
        >
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
            }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E87924]">
            {product.category}
          </span>
          <Link
            to={`/products/${product._id}`}
            className="block font-serif-editorial text-sm sm:text-base font-semibold text-[#191919] truncate hover:text-[#E87924] transition"
          >
            {product.name}
          </Link>
          <div className="mt-1 text-xs text-[#73736E]">
            {formatPrice(product.price)} each
          </div>
        </div>
      </div>

      {/* Steppers & Line Total */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E6E0]">
        {/* Quantity Controls */}
        <div className="flex items-center rounded-xl border border-[#E8E6E0] bg-white/80 p-1">
          <button
            onClick={handleDecrease}
            disabled={isMinQuantity || isUpdating}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[#191919] transition hover:bg-[#F2EFE9] disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-8 text-center text-xs font-semibold text-[#191919]">
            {isUpdating ? "..." : quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={isMaxQuantity || isUpdating}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[#191919] transition hover:bg-[#F2EFE9] disabled:opacity-30"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right min-w-[90px]">
          <span className="font-serif-editorial text-sm sm:text-base font-bold text-[#191919]">
            {formatPrice(lineTotal)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="rounded-lg p-1.5 text-[#73736E] transition hover:bg-red-50 hover:text-red-600"
          title="Remove item"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
