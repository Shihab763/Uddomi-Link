import { useEffect, useState } from "react";

export default function ReportSellerModal({ isOpen, onClose, onSubmit, sellerName }) {
  const [reason, setReason] = useState("Scam");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("Scam");
      setDetails("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ reason, details });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Report Seller</h2>
            <p className="mt-1 text-sm text-gray-600">
              Reporting: <span className="font-medium">{sellerName || "Seller"}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            >
              <option value="Scam">Scam</option>
              <option value="Fake product">Fake product</option>
              <option value="Harassment">Harassment</option>
              <option value="Inappropriate behavior">Inappropriate behavior</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              rows={4}
              placeholder="Describe what happened (optional but helpful)."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
