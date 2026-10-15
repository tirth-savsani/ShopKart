import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Home() {
  const { user } = useAuth();

  const curatedCategories = [
    { name: "Electronics", desc: "Studio acoustics, mechanical decks & optics", icon: "⚡" },
    { name: "Fashion", desc: "Heavyweight boxy cottons & selvedge denim", icon: "🧥" },
    { name: "Home & Living", desc: "Ceramics, flax linen & architectural lights", icon: "🏺" },
    { name: "Workspace", desc: "Brass tools, felt desk mats & walnut risers", icon: "🖋️" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome Glass Card */}
        <div className="rounded-3xl glass-panel p-8 sm:p-12 shadow-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E87924]/10 px-3 py-1 text-xs font-semibold text-[#E87924]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E87924]" />
            Authenticated Customer Session
          </span>

          <h1 className="mt-4 font-serif-editorial text-3xl sm:text-5xl font-bold text-[#191919] tracking-tight">
            Welcome back, {user?.name || "Member"}.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#73736E] max-w-2xl leading-relaxed">
            Your personal collection space is active. Explore our newly released 50+ item catalog,
            manage your saved wishlist, or complete your checkout bag.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E87924] px-6 py-3 text-xs uppercase tracking-wider font-semibold text-white shadow-sm hover:bg-[#D4691B] transition active:scale-[0.99]"
            >
              Explore 50+ Products
            </Link>

            <Link
              to="/cart"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8E6E0] bg-white px-6 py-3 text-xs uppercase tracking-wider font-semibold text-[#191919] hover:bg-[#F2EFE9] transition"
            >
              View Shopping Bag
            </Link>

            <Link
              to="/wishlist"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8E6E0] bg-white px-6 py-3 text-xs uppercase tracking-wider font-semibold text-[#191919] hover:bg-[#F2EFE9] transition"
            >
              Saved Wishlist
            </Link>
          </div>
        </div>

        {/* Quick Discovery Cards */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-editorial text-lg font-bold text-[#191919]">
              Curated Disciplines
            </h3>
            <Link to="/products" className="text-xs font-semibold text-[#E87924] hover:underline">
              View All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {curatedCategories.map((c) => (
              <Link
                key={c.name}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="rounded-2xl glass-card p-5 group transition"
              >
                <div className="text-2xl mb-3">{c.icon}</div>
                <h4 className="font-serif-editorial text-base font-bold text-[#191919] group-hover:text-[#E87924] transition">
                  {c.name}
                </h4>
                <p className="mt-1 text-xs text-[#73736E] leading-relaxed">
                  {c.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
