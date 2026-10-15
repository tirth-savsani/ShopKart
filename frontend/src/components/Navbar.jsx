import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getWishlist } from "../services/api";

export default function Navbar({ onOpenSearch }) {
  const { user, logout, openAuthModal } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Monitor scroll for subtle Apple-style glass effect enhancement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch wishlist count
  useEffect(() => {
    let ignore = false;
    if (!user) {
      setWishlistCount(0);
      return;
    }

    const loadWishlistCount = async () => {
      try {
        const data = await getWishlist();
        if (!ignore && data && data.success) {
          setWishlistCount(typeof data.count === "number" ? data.count : 0);
        }
      } catch {
        // Silently catch
      }
    };

    loadWishlistCount();

    const handleWishlistUpdate = () => loadWishlistCount();
    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    return () => {
      ignore = true;
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, [user]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#171717] px-4 py-2 text-center text-[11px] font-medium tracking-widest text-[#F7F6F2]/90 uppercase transition-colors">
        <span>Thoughtfully selected essentials. Complimentary worldwide shipping over ₹999.</span>
      </div>

      {/* Main Glass Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "glass-nav py-3 shadow-[0_4px_24px_rgba(25,25,25,0.04)]"
            : "bg-[#F7F6F2]/90 backdrop-blur-md py-4 border-b border-[#E8E6E0]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E87924] font-serif-editorial text-lg font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                S
              </span>
              <div className="flex flex-col">
                <span className="font-serif-editorial text-xl font-bold tracking-tight text-[#191919]">
                  ShopKart
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#73736E] -mt-1">
                  Edition
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                to="/"
                className={`transition-colors hover:text-[#E87924] ${
                  isActive("/") ? "text-[#E87924] font-semibold" : "text-[#191919]"
                }`}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`transition-colors hover:text-[#E87924] ${
                  isActive("/products") ? "text-[#E87924] font-semibold" : "text-[#191919]"
                }`}
              >
                Catalog
              </Link>
              {user && (
                <Link
                  to="/orders"
                  className={`transition-colors hover:text-[#E87924] ${
                    isActive("/orders") ? "text-[#E87924] font-semibold" : "text-[#191919]"
                  }`}
                >
                  My Orders
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch || (() => navigate("/products"))}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#73736E] transition hover:bg-[#E8E6E0]/60 hover:text-[#191919]"
              aria-label="Search collection"
              title="Search products"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#73736E] transition hover:bg-[#E8E6E0]/60 hover:text-[#191919]"
              aria-label="Saved Wishlist"
              title="Saved items"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#191919] px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#73736E] transition hover:bg-[#E8E6E0]/60 hover:text-[#191919]"
              aria-label="Shopping Cart"
              title="Shopping cart"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.188-.578-1.118-1.243l1.262-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E87924] px-1 text-[9px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account / User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-[#E8E6E0] bg-white/70 py-1 pl-2 pr-3 text-xs font-medium text-[#191919] transition hover:border-[#D5D2C9] hover:bg-white"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E87924]/15 text-[11px] font-bold text-[#E87924]">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl glass-dropdown p-1.5 shadow-xl animate-slide-up z-50">
                    <div className="border-b border-[#E8E6E0] px-3 py-2 text-xs">
                      <p className="font-semibold text-[#191919] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#73736E] truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/home"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#191919] transition hover:bg-[#F2EFE9]"
                    >
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#191919] transition hover:bg-[#F2EFE9]"
                    >
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#191919] transition hover:bg-[#F2EFE9]"
                    >
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#191919] transition hover:bg-[#F2EFE9]"
                    >
                      <span>Wishlist ({wishlistCount})</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 text-left"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="rounded-full px-3.5 py-2 text-xs font-medium text-[#191919] transition hover:bg-[#E8E6E0]/60"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="rounded-full bg-[#191919] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-black active:scale-[0.98]"
                >
                  Join
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#73736E] md:hidden transition hover:bg-[#E8E6E0]/60"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E8E6E0] bg-[#F7F6F2] px-4 py-6 md:hidden animate-slide-up">
            <nav className="flex flex-col gap-3 text-sm font-medium">
              <Link
                to="/"
                className="rounded-xl px-3 py-2 text-[#191919] transition hover:bg-[#E8E6E0]"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="rounded-xl px-3 py-2 text-[#191919] transition hover:bg-[#E8E6E0]"
              >
                Browse All Products
              </Link>
              {user && (
                <Link
                  to="/orders"
                  className="rounded-xl px-3 py-2 text-[#191919] transition hover:bg-[#E8E6E0]"
                >
                  My Orders
                </Link>
              )}

              <div className="my-2 border-t border-[#E8E6E0]" />

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="rounded-xl px-3 py-2 text-[#191919] transition hover:bg-[#E8E6E0]"
                  >
                    My Account ({user.name})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("login");
                    }}
                    className="flex-1 rounded-xl border border-[#E8E6E0] bg-white py-2.5 text-center text-xs font-semibold text-[#191919]"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("signup");
                    }}
                    className="flex-1 rounded-xl bg-[#E87924] py-2.5 text-center text-xs font-semibold text-white"
                  >
                    Join
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
