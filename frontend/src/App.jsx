import React from "react";

import ChatPage from "./components/ChatPage";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <ChatPage />
      <Toaster position="top-right" />
    </>
  );
}
