import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosCalls/axios";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNo: "",
    password: "",
  });
  const [err, setErr] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoader(true);

    try {
      const response = await axiosInstance.post("/customers/register", form);
      setUser(response.data.Customer);
      navigate("/home", { replace: true });
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4 py-12 selection:bg-[#E87924]/20 selection:text-[#E87924]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E87924] font-serif-editorial text-xl font-bold text-white shadow-sm transition group-hover:scale-105">
              S
            </span>
          </Link>
          <h1 className="mt-3 font-serif-editorial text-3xl font-bold tracking-tight text-[#191919]">
            Create Account
          </h1>
          <p className="mt-1 text-xs text-[#73736E]">
            Join ShopKart to discover curated, durable artifacts.
          </p>
        </div>

        {/* Glass Form Panel */}
        <div className="rounded-3xl glass-modal p-6 sm:p-8 shadow-xl">
          {err && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-xs text-red-700">
              {err}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Eleanor Vance"
                className="mt-1 w-full rounded-xl border border-[#E8E6E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:border-[#E87924] focus:bg-white focus:ring-1 focus:ring-[#E87924]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="eleanor@example.com"
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
                value={form.phoneNo}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="mt-1 w-full rounded-xl border border-[#E8E6E0] bg-white/70 px-3.5 py-2.5 text-sm text-[#191919] placeholder-[#9E9D97] outline-none transition focus:border-[#E87924] focus:bg-white focus:ring-1 focus:ring-[#E87924]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#73736E]">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
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
              disabled={loader}
              className="mt-2 w-full rounded-xl bg-[#E87924] py-3 text-xs uppercase tracking-wider font-semibold text-white shadow-sm transition hover:bg-[#D4691B] active:scale-[0.99] disabled:opacity-50"
            >
              {loader ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#E8E6E0] pt-4 text-center text-xs text-[#73736E]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#E87924] hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-[#73736E] hover:text-[#191919] transition">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
