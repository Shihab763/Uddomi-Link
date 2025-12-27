import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Mentees() {
  const user = JSON.parse(localStorage.getItem("user"));

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

  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState(null); // { type: "plans"|"recs", menteeId, menteeName }
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [msg, setMsg] = useState("");

  // Forms
  const [planForm, setPlanForm] = useState({ title: "", steps: "", deadline: "" });
  const [recForm, setRecForm] = useState({ trainingId: "", note: "" });
  const [trainings, setTrainings] = useState([]);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/mentorship/mentees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load mentees");
      }

      const data = await res.json();
      setMentees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load mentees.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trainings`);
      if (!res.ok) return;
      const data = await res.json();
      setTrainings(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchMentees();
    fetchTrainings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPlans = async (menteeId, menteeName) => {
    setMode({ type: "plans", menteeId, menteeName });
    setItems([]);
    setItemsError("");
    setMsg("");

    try {
      setItemsLoading(true);
      const res = await fetch(`${API_BASE}/api/mentorship/plans/for-mentee/${menteeId}`, {
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

  const openRecs = async (menteeId, menteeName) => {
    setMode({ type: "recs", menteeId, menteeName });
    setItems([]);
    setItemsError("");
    setMsg("");

    try {
      setItemsLoading(true);
      const res = await fetch(`${API_BASE}/api/mentorship/recommendations/for-mentee/${menteeId}`, {
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

  const addPlan = async () => {
    try {
      setMsg("");
      setItemsError("");

      if (!planForm.title.trim()) {
        setItemsError("Title is required.");
        return;
      }

      const steps = planForm.steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`${API_BASE}/api/mentorship/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessOwnerId: mode.menteeId,
          title: planForm.title.trim(),
          steps,
          deadline: planForm.deadline ? planForm.deadline : null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create plan");
      }

      const created = await res.json();
      setItems((prev) => [created, ...prev]);
      setPlanForm({ title: "", steps: "", deadline: "" });
      setMsg("Action plan added.");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setItemsError(err.message || "Could not create plan.");
    }
  };

  const addRec = async () => {
    try {
      setMsg("");
      setItemsError("");

      if (!recForm.trainingId) {
        setItemsError("Select a training.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/mentorship/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessOwnerId: mode.menteeId,
          trainingId: recForm.trainingId,
          note: recForm.note || "",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to recommend training");
      }

      const created = await res.json();
      setItems((prev) => [created, ...prev]);
      setRecForm({ trainingId: "", note: "" });
      setMsg("Recommendation added.");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setItemsError(err.message || "Could not add recommendation.");
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark mb-1">👥 Mentees</h1>
          <p className="text-sm text-gray-600">
            These creators accepted your mentorship. Add action plans and training recommendations.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">Loading mentees...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-red-600">Failed to load mentees</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
        ) : mentees.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">No mentees yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mentees.map((m) => {
              const mentee = m.mentee || {};
              const name = mentee.profile?.businessName || mentee.name || mentee.email || "Mentee";

              return (
                <div key={m.offerId} className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-bold text-dark">{name}</h2>
                  <p className="text-sm text-gray-600 mt-1">✉️ {mentee.email || "N/A"}</p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openPlans(mentee._id, name)}
                      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      📝 Action Plans
                    </button>
                    <button
                      onClick={() => openRecs(mentee._id, name)}
                      className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-dark hover:bg-yellow-500"
                    >
                      🎯 Recommendations
                    </button>
                    <Link
                      to={`/profile/${mentee._id}`}
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                    >
                      View Profile
                    </Link>
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
                    {mode.type === "plans" ? "📝 Action Plans" : "🎯 Recommendations"} — {mode.menteeName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {mode.type === "plans"
                      ? "Create and review action plans for this mentee."
                      : "Recommend trainings for this mentee."}
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

            {/* Forms */}
            {mode.type === "plans" ? (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-dark mb-3">+ Add Action Plan</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Title *</label>
                    <input
                      value={planForm.title}
                      onChange={(e) => setPlanForm((p) => ({ ...p, title: e.target.value }))}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="e.g., Improve product photos"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Deadline (optional)</label>
                    <input
                      type="date"
                      value={planForm.deadline}
                      onChange={(e) => setPlanForm((p) => ({ ...p, deadline: e.target.value }))}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Steps (one per line)
                    </label>
                    <textarea
                      rows={5}
                      value={planForm.steps}
                      onChange={(e) => setPlanForm((p) => ({ ...p, steps: e.target.value }))}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                      placeholder={"Step 1...\nStep 2...\nStep 3..."}
                    />
                  </div>
                </div>

                <button
                  onClick={addPlan}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded hover:opacity-90 font-bold"
                >
                  Publish Plan
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-dark mb-3">+ Add Recommendation</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Training *</label>
                    <select
                      value={recForm.trainingId}
                      onChange={(e) => setRecForm((p) => ({ ...p, trainingId: e.target.value }))}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select training</option>
                      {trainings.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Note (optional)</label>
                    <input
                      value={recForm.note}
                      onChange={(e) => setRecForm((p) => ({ ...p, note: e.target.value }))}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Short instruction..."
                    />
                  </div>
                </div>

                <button
                  onClick={addRec}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded hover:opacity-90 font-bold"
                >
                  Add Recommendation
                </button>
              </div>
            )}

            {/* Lists */}
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
                          <h4 className="font-bold text-dark">{it.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: {it.status || "incomplete"}
                            {it.deadline ? ` • Deadline: ${new Date(it.deadline).toLocaleDateString()}` : ""}
                          </p>
                          {(it.steps || []).length ? (
                            <ul className="mt-2 list-disc ml-5 text-sm text-gray-700">
                              {it.steps.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <h4 className="font-bold text-dark">{it.trainingId?.title || "Training"}</h4>
                          <p className="text-xs text-gray-500 mt-1">Status: {it.status || "incomplete"}</p>
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

export default Mentees;
