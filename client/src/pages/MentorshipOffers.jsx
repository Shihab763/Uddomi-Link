import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MentorshipOffers() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    );
  }

  const isBusinessOwner = user?.roles?.includes("business-owner");
  if (!isBusinessOwner) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg">
          <h2 className="text-xl font-bold text-dark mb-2">Access denied</h2>
          <p className="text-sm text-gray-600">This page is only for business owners.</p>
          <Link to="/dashboard" className="inline-block mt-4 text-primary hover:underline">
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = user?.token || user?.accessToken || "";

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/mentorship/offers/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load offers");
      }

      const data = await res.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setMsg("");
      setError("");

      const res = await fetch(`${API_BASE}/api/mentorship/offers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update offer");
      }

      setOffers((prev) => prev.filter((o) => o._id !== id));
      setMsg(`Offer ${status}.`);
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setError(err.message || "Could not update offer.");
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark mb-1">🤝 Mentorship Offers</h1>
          <p className="text-sm text-gray-600">
            Review mentorship offers from NGOs. Accept or reject.
          </p>

          {msg ? (
            <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{msg}</div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">No pending mentorship offers</p>
            <Link to="/dashboard" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded hover:opacity-90 font-bold">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((o) => (
              <div key={o._id} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold text-dark">
                  {o.ngoId?.profile?.businessName || o.ngoId?.name || o.ngoId?.email || "NGO"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">✉️ {o.ngoId?.email || "N/A"}</p>

                {o.message ? (
                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                    <span className="font-semibold">Message: </span>{o.message}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateStatus(o._id, "accepted")}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => updateStatus(o._id, "rejected")}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorshipOffers;
