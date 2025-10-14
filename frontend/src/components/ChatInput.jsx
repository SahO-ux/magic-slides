import React, { useState } from "react";

export default function ChatInput({ onSend, onEdit, loading }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start with a topic, we'll turn it into slides!"
        className="w-full rounded-xl border p-4 pr-40 min-h-[64px] resize-none"
      />
      <div className="absolute right-4 bottom-4 flex items-center gap-2">
        <button
          onClick={() => {
            onEdit();
          }}
          className="p-2 rounded-md border bg-white"
          title="Quick edit"
        >
          +
        </button>
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="p-3 rounded-md bg-gray-800 text-white"
          title="Send"
        >
          {/* simple paper plane */}⤴
        </button>
      </div>
    </div>
  );
}
