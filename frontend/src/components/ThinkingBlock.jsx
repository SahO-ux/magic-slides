import React from "react";

export default function ThinkingBlock() {
  return (
    <div className="max-w-[85%] bg-white rounded-lg p-4 border border-purple-200">
      <div className="text-sm text-purple-700 font-semibold">Thinking...</div>
      <div className="mt-2 text-sm text-gray-700">
        Defining the Scope
        <div className="mt-2 text-xs text-gray-500">
          I'm gathering information and preparing slides. This may take a
          moment.
        </div>
      </div>
    </div>
  );
}
