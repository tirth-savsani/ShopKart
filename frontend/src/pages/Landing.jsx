import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">ShopKart</h1>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-sm font-medium text-indigo-600">Online shopping</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Welcome to ShopKart
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-500">
          Create an account or log in to start shopping. Your session is stored
          in a secure cookie and stays in sync with the ShopKart API.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/signup"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            I already have an account
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Landing;
