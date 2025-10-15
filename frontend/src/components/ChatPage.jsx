import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { sendPrompt } from "../helpers/api";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import ThinkingBlock from "./ThinkingBlock";
import SlidePreview from "./SlidePreview";

export default function ChatPage() {
  const chatRef = useRef();

  // read content limit from env (Vite requires VITE_ prefix)
  const CONTENT_LIMIT =
    Number(import.meta.env.VITE_CONTENT_LIMIT) || "900-1200";
  const SLIDE_LIMIT = Number(import.meta.env.VITE_MAX_SLIDES) || 7;

  const [messages, setMessages] = useState([]); // {role:'user'|'ai'|'system', text}

  const [slidesJson, setSlidesJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [partialWarning, setPartialWarning] = useState(null);

  // NEW: whether user has started the session (used to switch layout)
  const [hasStarted, setHasStarted] = useState(false);
  // NEW: whether we should show the slides column (split view). Default false.
  // We only enable this after we actually receive slides (or partialSlidesJson).
  const [showSlides, setShowSlides] = useState(false);

  useEffect(() => {
    // auto-scroll
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const submitPrompt = async (prompt = null) => {
    if (!prompt || !prompt.trim()) return toast.error("Please enter a prompt");

    // Mark that user started: this will hide the hero and show chat-only view.
    setHasStarted(true);
    // ensure slides column is hidden while request is ongoing only if there are no slides yet
    if (!showSlides) setShowSlides(false);

    // use existing slides as context when available
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);
    setMessages((prev) => [...prev, { role: "ai", text: "Thinking..." }]);

    try {
      if (slidesJson?.usage) delete slidesJson.usage;
      const data = await sendPrompt(prompt, slidesJson || {});

      // Remove 'Thinking...' placeholder
      setMessages((prev) =>
        prev.filter((m) => !(m.role === "ai" && m.text === "Thinking..."))
      );

      // if the server returned truncation
      if (data?.error === "model_truncated") {
        // show toast
        toast.error("Unable to generate full PPT: model hit token limit.");

        // if partial content available, set it to slidesJson and set a flag to display banner
        if (data.partialSlidesJson) {
          setSlidesJson(data.partialSlidesJson);
          setMessages((prev) => [
            ...prev,
            { role: "ai", text: "Partial presentation generated (truncated)." },
          ]);
          // set a UI banner / flag
          setPartialWarning({
            message: "Partial presentation: model stopped due to token limit.",
            usage: data.usage || null,
          });

          // show slides column so user can see partial slides
          setShowSlides(true);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              text: "Unable to generate presentation — token limit reached. Please try using another prompt",
            },
          ]);
          setPartialWarning({
            message:
              "Generation failed: model hit token limit and no partial content is available.",
          });

          // keep showSlides as-is (do not hide existing slides)
        }
        return;
      }

      // If server returned some other error shape (non-ok) we can show it as toast
      if (data?.error && data?.error !== "model_truncated") {
        toast.error(data?.message || "Server error generating presentation");
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Error: " + (data?.message || data?.error) },
        ]);
        // keep showSlides unchanged
        return;
      }

      // Normal success — set slides and switch to split view
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Done. Presentation generated/updated." },
      ]);
      setSlidesJson(data.slidesJson || data);
      setPartialWarning(null);

      // Enable slides column (split view)
      setShowSlides(true);
    } catch (err) {
      console.error(err);
      toast.error("Error generating presentation");
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "ai" && m.text === "Thinking..."
            ? { role: "ai", text: "Error generating presentation" }
            : m
        )
      );
      // keep chat-only view if slides weren't shown
      // keep showSlides unchanged
    } finally {
      setLoading(false);
    }
  };

  const resetToHero = () => {
    // Reset everything: slides, partial warnings, messages, and UI flags
    setSlidesJson(null);
    setPartialWarning(null);
    setMessages([]);
    setHasStarted(false);
    setShowSlides(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* main area */}
      <div className="flex-1 flex">
        {/* If user has not started, show centered single-column chat (hero) */}
        {!hasStarted ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-xl p-12 shadow-sm">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
                  Hello,
                </h1>
                <p className="text-gray-600 mt-2">
                  What do you want me to generate today?
                </p>
              </div>

              <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ChatInput
                      onSend={submitPrompt}
                      loading={loading}
                      large={true}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 text-center">
                  Limit: up to {SLIDE_LIMIT} slides or ~{CONTENT_LIMIT} words
                  per request.
                </p>

                <div className="text-center text-xs text-gray-400 mt-1">
                  Tip: try “Create 5 slides about product roadmap” or “Generate
                  6 short slides on AI safety.”
                </div>
              </div>
            </div>
          </div>
        ) : (
          // user started: show chat column (centered & constrained) until slides ready, then split
          <>
            {!showSlides ? (
              // Chat-only constrained center column with sticky input and scrollable messages
              <div className="w-full flex justify-center bg-white">
                {/* this container must take viewport height so the messages area can flex and input stick */}
                <div className="w-full max-w-3xl flex flex-col h-screen">
                  {/* messages area: flex-1 + min-h-0 is essential for proper scrolling */}
                  <div
                    ref={chatRef}
                    className="flex-1 overflow-auto px-6 py-6 space-y-4 min-h-0"
                  >
                    {messages.map((m, i) => {
                      if (m.role === "ai" && m.text === "Thinking...") {
                        return <ThinkingBlock key={i} />;
                      }
                      return <ChatMessage key={i} msg={m} />;
                    })}
                  </div>

                  {/* sticky input area inside constrained column */}
                  <div className="sticky bottom-0 bg-white px-6 pb-6 pt-4 border-t z-10">
                    <ChatInput onSend={submitPrompt} loading={loading} />
                    <p className="text-xs text-gray-400 mt-2">
                      Limit: up to {SLIDE_LIMIT} slides or ~{CONTENT_LIMIT}{" "}
                      words per request.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Split view: left chat, right slides
              <div className="w-full flex flex-col md:flex-row md:items-stretch">
                {/* Chat column */}
                <div className="w-full md:w-1/2 flex flex-col bg-white h-screen">
                  <div
                    ref={chatRef}
                    className="flex-1 overflow-auto px-6 md:px-8 py-6 space-y-4 min-h-0"
                  >
                    {messages.map((m, i) => {
                      if (m.role === "ai" && m.text === "Thinking...") {
                        return <ThinkingBlock key={i} />;
                      }
                      return <ChatMessage key={i} msg={m} />;
                    })}
                  </div>

                  {/* sticky bottom input in chat column */}
                  <div className="sticky bottom-0 bg-white border-t p-4 md:p-6 z-10">
                    <ChatInput onSend={submitPrompt} loading={loading} />
                    <p className="text-xs text-gray-400 mt-2">
                      Limit: up to {SLIDE_LIMIT} slides or ~{CONTENT_LIMIT}{" "}
                      words per request.
                    </p>
                  </div>
                </div>

                {/* Slides column */}
                <div className="w-full md:w-1/2 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 p-4 md:p-6 overflow-auto h-screen">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {slidesJson ? (
                        <span className="text-sm text-green-600">
                          ✓ {(slidesJson.slides || []).length} slides generated
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No slides yet
                        </span>
                      )}
                    </div>
                  </div>

                  {partialWarning && (
                    <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
                      <strong>Partial Result:</strong> {partialWarning.message}
                      {partialWarning.usage && (
                        <div className="text-xs text-gray-500 mt-1">
                          Prompt tokens: {partialWarning.usage.promptTokenCount}
                          , total tokens: {partialWarning.usage.totalTokenCount}
                        </div>
                      )}
                    </div>
                  )}

                  <SlidePreview
                    slidesJson={slidesJson}
                    partialWarning={partialWarning}
                    onReset={resetToHero}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
