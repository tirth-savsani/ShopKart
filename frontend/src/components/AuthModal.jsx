import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const { login, signup } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await login(formData.email, formData.password);
      } else {
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNo: formData.phoneNo,
        });
      }
      onClose();
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err.response?.data?.message ||
          (mode === "login" ? "Invalid email or password." : "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171717]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl glass-modal p-6 sm:p-8 shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[#73736E] transition hover:bg-[#F2EFE9] hover:text-[#191919]"
          aria-label="Close dialog"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87924] font-serif-editorial text-lg font-bold text-white shadow-sm">
            S
          </div>
          <h2 className="font-serif-editorial text-2xl font-bold tracking-tight text-[#191919]">
            {mode === "login" ? "Welcome back" : "Join ShopKart"}
          </h2>
          <p className="mt-1 text-xs text-[#73736E]">
            {mode === "login"
              ? "Sign in to access your curated wishlist and cart."
              : "Discover thoughtfully crafted essentials designed for living."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Eleanor Vance"
                  className="mt-1 w-full rounded-xl border border-[#E8E6E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:border-[#E87924] focus:bg-white focus:ring-1 focus:ring-[#E87924]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNo"
                  required
                  value={formData.phoneNo}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="mt-1 w-full rounded-xl border border-[#E8E6E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:border-[#E87924] focus:bg-white focus:ring-1 focus:ring-[#E87924]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="eleanor@example.com"
              className="mt-1 w-full rounded-xl border border-[#E8E6E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:border-[#E87924] focus:bg-white focus:ring-1 focus:ring-[#E87924]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                Password
              </label>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E8E6E0] bg-white/70 px-3.5 py-2.5 pr-10 text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:border-[#E87924] focus:bg-white focus:ring-1 focus:ring-[#E87924]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#73736E] hover:text-[#191919]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-[#E87924] py-3 text-sm font-medium tracking-wide text-white shadow-sm transition hover:bg-[#D4691B] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 border-t border-[#E8E6E0] pt-4 text-center text-xs text-[#73736E]">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="font-medium text-[#E87924] hover:underline"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-medium text-[#E87924] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
