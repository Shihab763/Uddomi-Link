import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Creators() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    );
  }

  const isNgo = user?.roles?.includes("ngo");
  if (!isNgo) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg">
          <h2 className="text-xl font-bold text-dark mb-2">Access denied</h2>
          <p className="text-sm text-gray-600">This page is only for NGOs.</p>
          <Link to="/dashboard" className="inline-block mt-4 text-primary hover:underline">
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = user?.token || user?.accessToken || "";

  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/mentorship/creators`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load creators");
        }

        const data = await res.json();
        setCreators(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not load creators.");
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark mb-1">👩‍🎨 Creators</h1>
          <p className="text-sm text-gray-600">
            Browse business owners. Click a creator to open their profile.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">Loading creators...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-red-600">Failed to load</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">No creators found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((c) => {
              const profile = c.profile || {};
              const businessName = profile.businessName || c.name || c.email;

              return (
                <button
                  key={c._id}
                  onClick={() => navigate(`/profile/${c._id}`)}
                  className="text-left bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                >
                  <h2 className="text-lg font-bold text-dark">{businessName}</h2>
                  <p className="text-sm text-gray-600 mt-1">✉️ {c.email}</p>
                  {profile.businessType ? (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Type:</span> {profile.businessType}
                    </p>
                  ) : null}
                  <p className="text-xs text-gray-500 mt-3">Click to view profile</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Creators;
