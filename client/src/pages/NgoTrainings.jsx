import { useEffect, useMemo, useState } from "react";

function NgoTrainings() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    videoUrl: "",
    tags: "",
    description: "",
    level: "beginner",
    language: "Bangla",
    durationMinutes: "",
  });

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token =
    currentUser?.token ||
    currentUser?.accessToken ||
    currentUser?.jwt ||
    localStorage.getItem("token") ||
    "";

  const parsedTags = (tagsStr) =>
    tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const onChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const fetchMyTrainings = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("No auth token found. Please log out and log in again.");
      }

      const res = await fetch(`${API_BASE}/api/trainings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load NGO trainings");
      }

      const data = await res.json();
      setTrainings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load trainings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTrainings();
  }, []);

  const addTraining = async () => {
    setMsg("");
    setError("");

    if (!form.title.trim() || !form.videoUrl.trim()) {
      setError("Title and Video Link are required.");
      return;
    }

    try {
      if (!token) {
        throw new Error("No auth token found. Please log out and log in again.");
      }

      const payload = {
        title: form.title.trim(),
        videoUrl: form.videoUrl.trim(),
        description: form.description.trim(),
        tags: parsedTags(form.tags),
        level: form.level,
        language: form.language,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : 0,
        contentType: "video",
        isPublished: true,
      };

      const res = await fetch(`${API_BASE}/api/trainings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create training");
      }

      const created = await res.json();
      setTrainings((prev) => [created, ...prev]);

      setMsg("Training published successfully.");
      setForm({
        title: "",
        videoUrl: "",
        tags: "",
        description: "",
        level: "beginner",
        language: "Bangla",
        durationMinutes: "",
      });
    } catch (err) {
      setError(err.message || "Could not publish training.");
    }
  };

  const publishedCount = useMemo(
    () => trainings.filter((t) => t.isPublished).length,
    [trainings]
  );

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-dark mb-1">🎓 Trainings</h1>
          <p className="text-sm text-gray-600">
            Add video trainings for business owners to learn from. (NGO:{" "}
            <span className="font-semibold">{currentUser?.name || currentUser?.email}</span>)
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Published: {publishedCount}
          </p>

          {msg ? (
            <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
              {msg}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        {/* Add Training Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-dark mb-4">+ Add Training</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Title *</label>
              <input
                value={form.title}
                onChange={onChange("title")}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                placeholder="e.g., Pricing & Profit for Handmade Crafts"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Video Link *</label>
              <input
                value={form.videoUrl}
                onChange={onChange("videoUrl")}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                placeholder="YouTube / Drive / Vimeo link"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={onChange("tags")}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Pottery, Pricing, Marketing"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Level</label>
              <select
                value={form.level}
                onChange={onChange("level")}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Language</label>
              <input
                value={form.language}
                onChange={onChange("language")}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Bangla / English"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Duration (minutes)</label>
              <input
                value={form.durationMinutes}
                onChange={onChange("durationMinutes")}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                placeholder="e.g., 30"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Short Description</label>
              <textarea
                value={form.description}
                onChange={onChange("description")}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                rows={4}
                placeholder="What will sellers learn from this training?"
              />
            </div>
          </div>

          <button
            onClick={addTraining}
            className="mt-4 bg-primary text-white px-6 py-2 rounded hover:opacity-90 font-bold"
          >
            Publish
          </button>
        </div>

        {/* Trainings List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">Loading trainings...</p>
          </div>
        ) : trainings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-lg font-semibold text-dark">No trainings yet</p>
            <p className="text-sm text-gray-600 mt-2">
              Use “Add Training” to publish your first video.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trainings.map((t) => (
              <div key={t._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-dark">{t.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Published: {new Date(t.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(t.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {t.description ? (
                      <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                        {t.description}
                      </p>
                    ) : null}
                  </div>

                  <a
                    href={t.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-secondary text-dark px-4 py-2 text-sm font-semibold hover:bg-yellow-500 text-center"
                  >
                    ▶ View Video
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NgoTrainings;

