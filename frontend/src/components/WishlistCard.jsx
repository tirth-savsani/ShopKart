import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function WishlistCard({ product, onRemove }) {
  const { _id, name, price, category, image, stock } = product;
  const { addToCart } = useCart();
  const [removing, setRemoving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(_id);
    } finally {
      setRemoving(false);
    }
  };

  const handleMoveToBag = async () => {
    if (adding || stock <= 0) return;
    setAdding(true);
    try {
      const res = await addToCart(_id);
      if (res.success) {
        setFeedback("Moved to Bag");
        setTimeout(() => setFeedback(""), 2000);
      }
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl glass-card transition group">
      {/* Product Image Frame */}
      <Link
        to={`/products/${_id}`}
        className="relative block aspect-4/3 w-full overflow-hidden bg-[#F2EFE9]"
      >
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="glass-badge rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#191919]">
            {category}
          </span>
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/products/${_id}`} className="group-hover:text-[#E87924]">
          <h3 className="line-clamp-1 font-serif-editorial text-base font-semibold text-[#191919] transition">
            {name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-1 text-xs text-[#73736E]">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-[#E8E6E0] pt-3">
          <span className="font-serif-editorial text-base font-bold text-[#191919]">
            {formatPrice(price)}
          </span>

          <span className="text-[11px] font-semibold text-emerald-700">
            {stock > 0 ? `${stock} in stock` : "Sold out"}
          </span>
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleMoveToBag}
            disabled={adding || stock <= 0}
            className="flex-1 rounded-xl bg-[#E87924] py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#D4691B] disabled:opacity-50"
          >
            {adding ? "Adding..." : feedback ? feedback : "+ Add to Bag"}
          </button>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="rounded-xl border border-[#E8E6E0] p-2 text-[#73736E] transition hover:bg-red-50 hover:text-red-600"
            title="Remove from wishlist"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
