import React from "react";

export default function ChatMessage({ msg }) {
  if (msg.role === "system") {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="text-center whitespace-pre-wrap text-lg font-semibold">
          {msg.text}
        </div>
      </div>
    );
  }

  const bubbleClass =
    msg.role === "user" ? "ml-auto bg-blue-50 text-right" : "mr-auto bg-white";

  return (
    <div className={`max-w-[85%] ${bubbleClass} rounded-lg p-4 border`}>
      <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
    </div>
  );
}
