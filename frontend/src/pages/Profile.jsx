import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-10 text-gray-500">
        Customer profile not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto mb-4">
        <Link
          to="/home"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          ← Back to home
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Customer")}&background=6366f1&color=fff`}
            alt={user.name || "Profile"}
            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-50 shadow-sm"
          />

          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-500">{user.phoneNo}</p>
          </div>
        </div>

        <div className="py-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Account
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Signed in as a ShopKart customer. Your session is kept with an HTTP-only
            cookie from the backend.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
