import { useEffect, useMemo, useState } from "react";

function SkillHub() {
  const [trainings, setTrainings] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        setError("");

        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/trainings`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load trainings");
        }

        const data = await res.json();
        setTrainings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not load trainings.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set();
    trainings.forEach((t) => (t.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [trainings]);

  const filtered = useMemo(() => {
    return trainings.filter((t) => {
      const matchesTag = selectedTag === "All" || (t.tags || []).includes(selectedTag);

      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (t.title || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.tags || []).join(" ").toLowerCase().includes(q);

      return matchesTag && matchesQuery;
    });
  }, [trainings, selectedTag, query]);

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark mb-1">📚 Skill Hub</h1>
          <p className="text-sm text-gray-600">
            Curated trainings from NGOs and partners. Filter by tags and watch anytime.
          </p>

          <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trainings..."
              className="w-full md:w-1/2 border rounded-md px-3 py-2 text-sm"
            />

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full md:w-60 border rounded-md px-3 py-2 text-sm"
            >
              <option value="All">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">Loading trainings...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-red-600">Failed to load trainings</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">No trainings found</p>
            <p className="text-sm text-gray-600 mt-2">
              Try a different tag or search keyword.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => {
              const ngoName =
                t.createdByNgoId?.profile?.businessName ||
                t.createdByNgoId?.name ||
                t.createdByNgoId?.email ||
                "NGO";

              return (
                <div key={t._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-dark">{t.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      By <span className="font-semibold">{ngoName}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(t.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-700 mt-3 line-clamp-3">
                      {t.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>Level: {t.level}</span>
                      <span>{t.durationMinutes ? `${t.durationMinutes} min` : ""}</span>
                    </div>

                    <a
                      href={t.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-5 w-full text-center bg-primary text-white px-4 py-2 rounded hover:opacity-90 font-bold"
                    >
                      ▶ Watch
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillHub;
