import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { sendPrompt } from "../helpers/api";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import ThinkingBlock from "./ThinkingBlock";
import SlidePreview from "./SlidePreview";
import EditModal from "./EditModal";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      text: "Hello, user!\nWhat do you want me to generate today?",
    },
  ]); // {role:'user'|'ai'|'system', text}

  const [slidesJson, setSlidesJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const chatRef = useRef();

  //   useEffect(() => {
  //     // initial greeting block similar to screenshot 1
  //     setMessages([
  //       ,
  //     ]);
  //   }, []);

  useEffect(() => {
    // auto-scroll
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (prompt) => {
    if (!prompt) return toast.error("Please enter a prompt");

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    // show thinking block
    setMessages((prev) => [...prev, { role: "ai", text: "Thinking..." }]);

    try {
      const data = await sendPrompt(prompt, slidesJson || {});
      // remove the 'Thinking...' placeholder
      setMessages((prev) =>
        prev.filter((m) => !(m.role === "ai" && m.text === "Thinking..."))
      );
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Done. Presentation generated/updated." },
      ]);
      setSlidesJson(data.slidesJson || data);
    } catch (err) {
      console.error(err);
      toast.error("Error generating response");
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "ai" && m.text === "Thinking..."
            ? { role: "ai", text: "Error generating response" }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (editPrompt) => {
    setShowEdit(false);
    if (!editPrompt) return toast.error("Please enter a prompt");

    // use existing slides as context when available
    // Pass existing slidesJson as context so API can edit/update
    setMessages((prev) => [...prev, { role: "user", text: editPrompt }]);
    setLoading(true);
    setMessages((prev) => [...prev, { role: "ai", text: "Thinking..." }]);

    try {
      const data = await sendPrompt(editPrompt, slidesJson || {});
      setMessages((prev) =>
        prev.filter((m) => !(m.role === "ai" && m.text === "Thinking..."))
      );
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Presentation updated." },
      ]);
      setSlidesJson(data.slidesJson || data);
    } catch (err) {
      console.error(err);
      toast.error("Error updating presentation");
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "ai" && m.text === "Thinking..."
            ? { role: "ai", text: "Error updating presentation" }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* left sidebar narrow */}
      <div className="w-20 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="rounded-full bg-black text-white w-10 h-10 flex items-center justify-center">
          AI
        </div>
      </div>

      {/* main area */}
      <div className="flex-1 flex">
        {/* chat column */}
        <div className="w-1/2 flex flex-col bg-white">
          <div className="p-8">
            <h1 className="text-2xl font-semibold text-center">Hello</h1>
            <p className="text-center text-sm text-gray-600 mt-2">
              What do you want me to generate today?
            </p>
          </div>
          <div
            ref={chatRef}
            className="px-8 pb-6 overflow-auto flex-1 space-y-4"
          >
            {messages.map((m, i) => {
              if (m.role === "ai" && m.text === "Thinking...") {
                return <ThinkingBlock key={i} />;
              }
              return <ChatMessage key={i} msg={m} />;
            })}
          </div>

          <div className="p-6 border-t bg-white">
            <ChatInput
              onSend={handleSend}
              onEdit={() => setShowEdit(true)}
              loading={loading}
            />
          </div>
        </div>

        {/* slides column */}
        <div className="w-1/2 bg-gray-50 border-l border-gray-200 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {slidesJson ? (
                <span className="text-sm text-green-600">
                  ✓ {(slidesJson.slides || []).length} slides generated
                </span>
              ) : (
                <span className="text-sm text-gray-500">No slides yet</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="py-1 px-3 border rounded text-sm"
                onClick={() => setShowEdit(true)}
              >
                Edit Presentation
              </button>
            </div>
          </div>

          <SlidePreview slidesJson={slidesJson} />
        </div>
      </div>

      {showEdit && (
        <EditModal
          onClose={() => setShowEdit(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
