import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto max-w-md w-full px-4 py-20 text-center">
          <p className="text-sm text-[#73736E]">Customer profile not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-10 sm:px-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#73736E]">
          <Link to="/" className="hover:text-[#191919] transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-[#191919]">Account Profile</span>
        </nav>

        <div className="rounded-3xl glass-panel p-6 sm:p-10 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-[#E8E6E0]">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[#E87924]/15 font-serif-editorial text-3xl font-bold text-[#E87924] border border-[#E87924]/30 shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <span className="inline-block rounded-full bg-[#191919] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white mb-1">
                Verified Customer
              </span>
              <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191919]">
                {user.name}
              </h1>
              <p className="text-xs text-[#73736E]">{user.email}</p>
              <p className="text-xs text-[#73736E]">{user.phoneNo}</p>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
              Session & Security
            </h2>
            <div className="rounded-2xl border border-[#E8E6E0] bg-white/60 p-4 text-xs text-[#73736E] space-y-2">
              <p>
                <strong className="text-[#191919]">Authentication Model:</strong> Session is securely maintained using an HTTP-only JWT cookie with strict same-site controls.
              </p>
              <p>
                <strong className="text-[#191919]">Data Isolation:</strong> Your personal cart and wishlist are bound strictly to your authenticated MongoDB account ID.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E8E6E0]">
            <Link
              to="/products"
              className="rounded-xl bg-[#E87924] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#D4691B] transition"
            >
              Browse Catalog
            </Link>
            <Link
              to="/wishlist"
              className="rounded-xl border border-[#E8E6E0] bg-white px-5 py-2.5 text-xs font-semibold text-[#191919] hover:bg-[#F2EFE9] transition"
            >
              View Wishlist
            </Link>
            <Link
              to="/cart"
              className="rounded-xl border border-[#E8E6E0] bg-white px-5 py-2.5 text-xs font-semibold text-[#191919] hover:bg-[#F2EFE9] transition"
            >
              View Shopping Bag
            </Link>
            <button
              onClick={logout}
              className="ml-auto rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
