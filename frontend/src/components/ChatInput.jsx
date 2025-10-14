import React, { useState } from "react";

/**
 * ChatInput
 * Props:
 *  - onSend(text: string)
 *  - loading: boolean
 *  - large: boolean (optional) -> larger height for hero view
 */
export default function ChatInput({ onSend, loading = false, large = false }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (loading) return;
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // textarea size & padding (reserve space on right for the button)
  const textareaBase =
    "w-full rounded-xl border border-gray-200 bg-white resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-50";
  const textareaSize = large
    ? "min-h-[84px] px-6 py-4 text-base pr-28"
    : "min-h-[64px] px-5 py-3 text-sm pr-24";

  // send button: visually lighter, subtle border, vertically centered using top-1/2 transform
  const sendBtnBase =
    "absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md transition-all";
  const sendBtnEnabled =
    "bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50";
  const sendBtnDisabled =
    "bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed";

  return (
    <div className="relative w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start with a topic, we'll turn it into slides!"
        className={`${textareaBase} ${textareaSize}`}
        aria-label="Chat input"
        rows={1}
      />

      <button
        onClick={submit}
        disabled={loading || !String(text).trim()}
        aria-label="Send prompt"
        title="Send"
        className={`${sendBtnBase} ${
          loading || !String(text).trim() ? sendBtnDisabled : sendBtnEnabled
        } w-10 h-10`}
      >
        {/* subtle paper-plane icon (SVG) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}
