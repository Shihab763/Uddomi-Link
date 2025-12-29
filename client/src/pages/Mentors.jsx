import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Mentors() {
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

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState(null); // { type: "plans"|"recs", ngoId, ngoName }
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [msg, setMsg] = useState("");

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/mentorship/mentors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load mentors");
      }

      const data = await res.json();
      setMentors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load mentors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPlans = async (ngoId, ngoName) => {
    setMode({ type: "plans", ngoId, ngoName });
    setItems([]);
    setItemsError("");
    setMsg("");

    try {
      setItemsLoading(true);
      const res = await fetch(`${API_BASE}/api/mentorship/plans/my?ngoId=${ngoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load plans");
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setItemsError(err.message || "Could not load plans.");
    } finally {
      setItemsLoading(false);
    }
  };

  const openRecs = async (ngoId, ngoName) => {
    setMode({ type: "recs", ngoId, ngoName });
    setItems([]);
    setItemsError("");
    setMsg("");

    try {
      setItemsLoading(true);
      const res = await fetch(`${API_BASE}/api/mentorship/recommendations/my?ngoId=${ngoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load recommendations");
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setItemsError(err.message || "Could not load recommendations.");
    } finally {
      setItemsLoading(false);
    }
  };
  const endMentorship = async (offerId) => {
  const ok = window.confirm("End mentorship? This will remove the connection immediately.");
  if (!ok) return;

  try {
    setMsg("");
    setItemsError("");

    const res = await fetch(`${API_BASE}/api/mentorship/offers/${offerId}/end`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to end mentorship");
    }

    // Remove from mentors list
    setMentors((prev) => prev.filter((x) => x.offerId !== offerId));

    // close details view if open
    setMode(null);
    setItems([]);

    setMsg("Mentorship ended.");
    setTimeout(() => setMsg(""), 2500);
  } catch (err) {
    setItemsError(err.message || "Could not end mentorship.");
  }
};


  const completePlan = async (id) => {
    try {
      setMsg("");
      setItemsError("");

      const res = await fetch(`${API_BASE}/api/mentorship/plans/${id}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to complete plan");
      }

      const updated = await res.json();
      setItems((prev) => prev.map((x) => (x._id === id ? updated : x)));
      setMsg("Marked complete.");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setItemsError(err.message || "Could not update plan.");
    }
  };

  const completeRec = async (id) => {
    try {
      setMsg("");
      setItemsError("");

      const res = await fetch(`${API_BASE}/api/mentorship/recommendations/${id}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to complete recommendation");
      }

      const updated = await res.json();
      setItems((prev) => prev.map((x) => (x._id === id ? updated : x)));
      setMsg("Marked complete.");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setItemsError(err.message || "Could not update recommendation.");
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark mb-1">🧑‍🏫 Mentors</h1>
          <p className="text-sm text-gray-600">
            View your accepted mentors. Each mentor can give you action plans and recommendations.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">Loading mentors...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-red-600">Failed to load mentors</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">No mentors yet</p>
            <p className="text-sm text-gray-600 mt-2">
              Accept a mentorship offer to see mentors here.
            </p>
            <Link to="/" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded hover:opacity-90 font-bold">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mentors.map((m) => {
              const ngo = m.ngo || {};
              const name = ngo.profile?.businessName || ngo.name || ngo.email || "NGO";

              return (
                <div key={m.offerId} className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-bold text-dark">{name}</h2>
                  <p className="text-sm text-gray-600 mt-1">✉️ {ngo.email || "N/A"}</p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openPlans(ngo._id, name)}
                      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      📝 Action Plans
                    </button>
                    <button
                      onClick={() => openRecs(ngo._id, name)}
                      className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-dark hover:bg-yellow-500"
                    >
                      🎯 Recommendations
                    </button>
                    <button
                        onClick={() => endMentorship(m.offerId)}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                    🛑 End Mentorship
                 </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Details panel */}
        {mode ? (
          <div className="mt-10">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-dark">
                    {mode.type === "plans" ? "📝 Action Plans" : "🎯 Recommendations"} — {mode.ngoName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {mode.type === "plans"
                      ? "Complete plans when you finish them."
                      : "Complete recommendations after watching/doing them."}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setMode(null);
                    setItems([]);
                    setItemsError("");
                    setMsg("");
                  }}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                >
                  Close
                </button>
              </div>

              {msg ? (
                <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{msg}</div>
              ) : null}
              {itemsError ? (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{itemsError}</div>
              ) : null}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              {itemsLoading ? (
                <p className="text-sm text-gray-600">Loading...</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-gray-600">No items yet.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((it) => (
                    <div key={it._id} className="border rounded-lg p-4">
                      {mode.type === "plans" ? (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-dark">{it.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                Status: {it.status || "incomplete"}
                                {it.deadline ? ` • Deadline: ${new Date(it.deadline).toLocaleDateString()}` : ""}
                              </p>
                            </div>

                            {it.status !== "complete" ? (
                              <button
                                onClick={() => completePlan(it._id)}
                                className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                              >
                                ✅ Complete
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-md">
                                ✅ Completed
                              </span>
                            )}
                          </div>

                          {(it.steps || []).length ? (
                            <ul className="mt-2 list-disc ml-5 text-sm text-gray-700">
                              {it.steps.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-dark">{it.trainingId?.title || "Training"}</h4>
                              <p className="text-xs text-gray-500 mt-1">Status: {it.status || "incomplete"}</p>
                            </div>

                            {it.status !== "complete" ? (
                              <button
                                onClick={() => completeRec(it._id)}
                                className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                              >
                                ✅ Complete
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-md">
                                ✅ Completed
                              </span>
                            )}
                          </div>

                          {it.note ? (
                            <p className="text-sm text-gray-700 mt-2">
                              <span className="font-semibold">Note: </span>{it.note}
                            </p>
                          ) : null}

                          {it.trainingId?.videoUrl ? (
                            <a
                              href={it.trainingId.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-3 text-primary hover:underline text-sm font-semibold"
                            >
                              ▶ Watch training
                            </a>
                          ) : null}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Mentors;
