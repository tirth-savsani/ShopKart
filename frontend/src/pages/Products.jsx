import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { getProducts } from "../services/api";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Sync category with URL parameters when URL changes
  useEffect(() => {
    const cat = searchParams.get("category") || "";
    setCategory(cat);
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch products from Express backend
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    const fetchProductsData = async () => {
      try {
        const data = await getProducts({
          search: debouncedSearch,
          category,
          sort,
        });

        if (!ignore) {
          if (data && data.success && Array.isArray(data.products)) {
            setProducts(data.products);
          } else if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load products:", err);
          setError("Something went wrong while loading products.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProductsData();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, category, sort, retryCount]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat) {
      setSearchParams({ category: newCat });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCategory("");
    setSort("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#73736E]">
          <a href="/" className="hover:text-[#191919] transition">Home</a>
          <span>/</span>
          <span className="font-semibold text-[#191919]">Catalog</span>
          {category && (
            <>
              <span>/</span>
              <span className="text-[#E87924] font-medium">{category}</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E87924]">
                The Complete Collection
              </span>
              <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#191919]">
                {category ? category : "All Artifacts & Essentials"}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#73736E] max-w-xl">
                Explore 50+ carefully considered pieces crafted with natural materials,
                reliable ergonomics, and lasting design.
              </p>
            </div>

            {/* Total Results Count Badge */}
            {!loading && !error && (
              <div className="inline-flex items-center self-start sm:self-auto rounded-full glass-panel px-4 py-1.5 text-xs font-semibold text-[#191919]">
                <span>{products.length} {products.length === 1 ? "Product" : "Products"}</span>
              </div>
            )}
          </div>

          {/* Interactive Search & Filter Controls */}
          <div className="mt-8">
            <SearchBar
              search={searchTerm}
              setSearch={setSearchTerm}
              category={category}
              setCategory={handleCategoryChange}
              sort={sort}
              setSort={setSort}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* --- PRODUCT GRID STATES --- */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col rounded-2xl glass-card p-4 animate-pulse">
                <div className="aspect-4/3 rounded-xl bg-[#E8E6E0] mb-4" />
                <div className="h-4 w-3/4 rounded-sm bg-[#E8E6E0] mb-2" />
                <div className="h-3 w-full rounded-sm bg-[#E8E6E0] mb-3" />
                <div className="h-4 w-1/3 rounded-sm bg-[#E8E6E0] mt-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-2xl glass-panel p-8 text-center my-12 border border-red-200">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-serif-editorial text-lg font-bold text-[#191919]">
              Unable to reach product catalog
            </h3>
            <p className="mt-2 text-xs text-[#73736E]">
              We couldn't connect to MongoDB. Please verify your connection or try again.
            </p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="mt-5 inline-flex items-center rounded-xl bg-[#E87924] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#D4691B]"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl glass-panel p-10 text-center my-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EFE9] text-[#73736E]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-[#191919]">No artifacts match your query</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#73736E]">
              Try clearing your search terms or choosing another category from the filter pills above.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 inline-flex items-center rounded-xl bg-[#191919] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
