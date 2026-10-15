export default function SearchBar({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  onReset,
}) {
  const categories = [
    "All Categories",
    "Electronics",
    "Fashion",
    "Home & Living",
    "Books",
    "Wellness",
    "Workspace",
  ];

  const sortOptions = [
    { value: "", label: "Featured" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

  const hasActiveFilters = search || (category && category !== "All Categories") || sort;

  return (
    <div className="space-y-4">
      {/* Search Input & Sort Controls Box */}
      <div className="rounded-2xl glass-panel p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#73736E]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across 50+ curated products..."
              className="w-full rounded-xl border border-[#E8E6E0] bg-white/80 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:border-[#E87924] focus:bg-white focus:ring-1 focus:ring-[#E87924]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#73736E] hover:text-[#191919]"
                title="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[180px]">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#E8E6E0] bg-white/80 py-2.5 pl-3.5 pr-8 text-xs sm:text-sm font-medium text-[#191919] outline-none transition focus:border-[#E87924] focus:bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#73736E]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="rounded-xl border border-[#E8E6E0] bg-white/60 px-4 py-2.5 text-xs font-semibold text-[#73736E] transition hover:bg-white hover:text-[#191919]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected =
            category === cat ||
            (!category && cat === "All Categories") ||
            (category === "" && cat === "All Categories");

          return (
            <button
              key={cat}
              onClick={() => setCategory(cat === "All Categories" ? "" : cat)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95 ${
                isSelected
                  ? "bg-[#191919] text-white shadow-sm"
                  : "border border-[#E8E6E0] bg-white/70 text-[#73736E] hover:border-[#D5D2C9] hover:bg-white hover:text-[#191919]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
