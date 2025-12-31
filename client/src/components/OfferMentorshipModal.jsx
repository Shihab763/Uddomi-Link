import { useState } from "react";

function OfferMentorshipModal({ isOpen, onClose, onSubmit, businessOwnerName }) {
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-bold text-dark">
            🤝 Offer Mentorship {businessOwnerName ? `to ${businessOwnerName}` : ""}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Write a short message explaining how you can help.
          </p>
        </div>

        <div className="px-6 py-4">
          <label className="text-sm font-semibold text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Example: We can help you with pricing, branding, and marketing..."
          />
        </div>

        <div className="flex gap-2 justify-end px-6 py-4 border-t">
          <button
            onClick={() => {
              setMessage("");
              onClose();
            }}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit({ message })}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfferMentorshipModal;
