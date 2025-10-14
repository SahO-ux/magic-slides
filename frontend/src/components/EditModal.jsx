import React, { useState } from "react";

export default function EditModal({ onClose, onSubmit }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-[560px] p-6 z-10">
        <h3 className="text-lg font-semibold">Edit presentation</h3>
        <p className="text-sm text-gray-600 mt-1">
          Describe what to change (e.g., change slide 3 title to "Market
          Opportunity" and remove bullet 2).
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full mt-4 border rounded p-3"
          placeholder="E.g. Update slide 2 title to 'What is AI?' and shorten bullets."
        />
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="px-3 py-1 bg-gray-800 text-white rounded"
          >
            Apply edits
          </button>
        </div>
      </div>
    </div>
  );
}
