import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openAuthModal } = useAuth();

  useEffect(() => {
    let ignore = false;
    const fetchFeatured = async () => {
      try {
        const data = await getProducts();
        if (!ignore && data.success && Array.isArray(data.products)) {
          // Take 8 curated items
          setFeaturedProducts(data.products.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchFeatured();
    return () => {
      ignore = true;
    };
  }, []);

  const categories = [
    {
      name: "Electronics",
      tagline: "Precision Audio & Workspace Tools",
      count: "12 Items",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Fashion",
      tagline: "Timeless Silhouettes & Natural Textiles",
      count: "11 Items",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Home & Living",
      tagline: "Ceramics, Warm Lighting & Stoneware",
      count: "11 Items",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Books",
      tagline: "Enduring Architecture & Software Craft",
      count: "6 Titles",
      image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-[#E8E6E0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6 z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E6E0] bg-white/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#73736E] mb-6 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E87924]" />
                New Autumn / Winter Collection
              </div>

              <h1 className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#191919] leading-[1.08]">
                Everyday essentials. <br />
                <span className="italic font-normal text-[#73736E]">
                  Extraordinary style.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#73736E] max-w-xl">
                Discover thoughtfully selected pieces designed to complement your lifestyle,
                elevate your space, and bring quiet elegance to your everyday rituals.
              </p>

              {/* CTA Group */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#E87924] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D4691B] active:scale-[0.98]"
                >
                  Explore Collection
                </Link>
                <Link
                  to="/products?category=Electronics"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#E8E6E0] bg-white/80 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-[#191919] transition hover:bg-white hover:border-[#D5D2C9] active:scale-[0.98]"
                >
                  Discover Tech & Audio
                </Link>
              </div>

              {/* Quality Guarantee Mini Metrics */}
              <div className="mt-12 sm:mt-14 grid grid-cols-3 gap-6 pt-8 border-t border-[#E8E6E0] w-full">
                <div>
                  <p className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191919]">50+</p>
                  <p className="text-xs text-[#73736E] mt-0.5">Curated Items</p>
                </div>
                <div>
                  <p className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191919]">100%</p>
                  <p className="text-xs text-[#73736E] mt-0.5">Authentic Origin</p>
                </div>
                <div>
                  <p className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#191919]">4.9★</p>
                  <p className="text-xs text-[#73736E] mt-0.5">Customer Rating</p>
                </div>
              </div>
            </div>

            {/* Right Editorial Hero Image Grid */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card */}
                <div className="relative aspect-4/5 overflow-hidden rounded-3xl glass-card shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
                    alt="Studio Pro Wireless Headphones"
                    className="h-full w-full object-cover object-center transition-transform duration-1000 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="glass-badge rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-white mb-2 inline-block">
                      Featured Essential
                    </span>
                    <h3 className="font-serif-editorial text-xl font-bold">Studio Pro Acoustics</h3>
                    <p className="text-xs text-white/80 mt-1 line-clamp-1">
                      Adaptive noise cancellation in handcrafted natural finishes.
                    </p>
                  </div>
                </div>

                {/* Floating Glass Accent Pill */}
                <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl glass-modal p-4 shadow-xl border border-white/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87924]/15 text-[#E87924]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191919]">Verified Quality</p>
                    <p className="text-[11px] text-[#73736E]">2-Year ShopKart Warranty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- EDITORIAL PROMOTIONAL FEATURE --- */}
      <section className="py-16 sm:py-24 border-b border-[#E8E6E0] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-16/10 overflow-hidden rounded-3xl bg-[#F2EFE9]">
              <img
                src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1000&auto=format&fit=crop&q=80"
                alt="Workspace tools"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="flex flex-col items-start md:pl-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E87924]">
                The Creative Workspace
              </span>
              <h2 className="mt-2 font-serif-editorial text-3xl sm:text-4xl font-bold text-[#191919]">
                Tools designed for flow, clarity, and daily purpose.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#73736E]">
                From machined brass pens to solid walnut perches, our workspace collection
                is curated to remove friction and inspire your best thinking every morning.
              </p>
              <Link
                to="/products?category=Workspace"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#191919] hover:text-[#E87924] transition-colors group"
              >
                <span>Browse Desk Artifacts</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY CURATION SECTION --- */}
      <section className="py-16 sm:py-24 border-b border-[#E8E6E0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#73736E]">
                Disciplines & Mediums
              </span>
              <h2 className="mt-2 font-serif-editorial text-3xl sm:text-4xl font-bold text-[#191919]">
                Shop by Curated Category
              </h2>
            </div>
            <Link
              to="/products"
              className="mt-4 sm:mt-0 text-xs font-semibold text-[#E87924] hover:underline"
            >
              View Full Catalog ({52} Products) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-2xl glass-card aspect-3/4 flex flex-col justify-end p-6"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent transition-opacity group-hover:from-black/90" />

                <div className="relative z-10 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E87924]">
                    {cat.count}
                  </span>
                  <h3 className="font-serif-editorial text-xl font-bold mt-1 text-white">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-1">
                    {cat.tagline}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/90 group-hover:text-white group-hover:underline">
                    Explore Collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS HIGHLIGHT --- */}
      <section className="py-16 sm:py-24 border-b border-[#E8E6E0] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#E87924]">
                Signature Selection
              </span>
              <h2 className="mt-2 font-serif-editorial text-3xl sm:text-4xl font-bold text-[#191919]">
                Featured Artifacts
              </h2>
            </div>
            <Link
              to="/products"
              className="mt-4 sm:mt-0 rounded-full border border-[#E8E6E0] bg-[#F7F6F2] px-5 py-2 text-xs font-semibold text-[#191919] hover:bg-white hover:border-[#D5D2C9] transition"
            >
              Browse All Products
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-4/3 rounded-2xl bg-[#F2EFE9] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- BRAND VALUE PILLARS --- */}
      <section className="py-16 sm:py-20 border-b border-[#E8E6E0] bg-[#F7F6F2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-start p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E8E6E0] text-[#E87924] shadow-xs mb-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75m0 0A1.125 1.125 0 0013.125 2.625h-6.75A1.125 1.125 0 005.25 3.75v15" />
                </svg>
              </div>
              <h4 className="font-serif-editorial text-base font-bold text-[#191919]">Free Express Shipping</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#73736E]">
                Complimentary tracked dispatch on all orders over ₹999 worldwide.
              </p>
            </div>

            <div className="flex flex-col items-start p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E8E6E0] text-[#E87924] shadow-xs mb-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h4 className="font-serif-editorial text-base font-bold text-[#191919]">Guaranteed Authenticity</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#73736E]">
                Direct relationships with creators, master craftspeople, and verified manufacturers.
              </p>
            </div>

            <div className="flex flex-col items-start p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E8E6E0] text-[#E87924] shadow-xs mb-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h4 className="font-serif-editorial text-base font-bold text-[#191919]">30-Day Effortless Returns</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#73736E]">
                No questions asked return portal with home doorstep pickup.
              </p>
            </div>

            <div className="flex flex-col items-start p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E8E6E0] text-[#E87924] shadow-xs mb-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-serif-editorial text-base font-bold text-[#191919]">Secure Encrypted Checkout</h4>
              <p className="mt-1 text-xs leading-relaxed text-[#73736E]">
                Bank-grade tokenized payments with zero credential storage on client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#171717] text-[#9E9D97] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2E2E2E]">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E87924] font-serif-editorial font-bold text-white">
                  S
                </span>
                <span className="font-serif-editorial text-xl font-bold tracking-tight">ShopKart</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed">
                A design-led shopping destination honoring longevity, materiality, and contemporary craftsmanship.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-white">Curations</h5>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li><Link to="/products?category=Electronics" className="hover:text-white transition">Electronics</Link></li>
                <li><Link to="/products?category=Fashion" className="hover:text-white transition">Fashion</Link></li>
                <li><Link to="/products?category=Home%20%26%20Living" className="hover:text-white transition">Home & Living</Link></li>
                <li><Link to="/products?category=Workspace" className="hover:text-white transition">Workspace Tools</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-white">Customer Care</h5>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li><Link to="/cart" className="hover:text-white transition">Bag & Checkout</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition">Wishlist</Link></li>
                <li><button onClick={() => openAuthModal("login")} className="hover:text-white transition">Account Access</button></li>
                <li><span className="cursor-pointer hover:text-white transition">Order Tracking</span></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-white">Journal & Notes</h5>
              <p className="mt-4 text-xs leading-relaxed">
                Receive weekly dispatches on product architecture and seasonal drops.
              </p>
              <div className="mt-3 flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full rounded-l-xl bg-[#2E2E2E] px-3 py-2 text-xs text-white placeholder-[#73736E] outline-none"
                />
                <button
                  type="button"
                  className="rounded-r-xl bg-[#E87924] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D4691B]"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-4">
            <p>© {new Date().getFullYear()} ShopKart Inc. All rights reserved. Built with MERN.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition">Sustainability Pledge</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
