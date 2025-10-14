import React, { useState, useEffect } from "react";
import axios from "axios";

import ChatPage from "./components/ChatPage";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [isServerReady, setIsServerReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Please wait, server is waking up..."
  );

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/health`, {
        timeout: 10000, // 10 seconds timeout
      });
      if (res.status === 200) {
        setStatusMessage("Server is ready!");
        setTimeout(() => setIsServerReady(true), 800); // Small delay for smoother transition
      }
    } catch (err) {
      setStatusMessage("Still waking up... please hold on!");
      setTimeout(checkHealth, 5000); // Retry every 5 seconds
    }
  };

  if (!isServerReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">{statusMessage}</p>
        <p className="text-sm text-gray-500 mt-2">
          This may take 20–40 seconds if server was idle.
        </p>
      </div>
    );
  }
  return (
    <>
      <ChatPage />
      <Toaster position="top-right" />
    </>
  );
}
