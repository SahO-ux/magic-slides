import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081";

/**
 * Send a prompt to backend.
 * - prompt: string
 * - context: object (current slides JSON or any extra context)
 */
export async function sendPrompt(prompt, context = {}) {
  const payload = { prompt };
  // include context only if provided (send {} otherwise so backend can detect)
  payload.context = context || {};

  const resp = await axios.post(`${API_BASE}/chat`, payload, {
    timeout: 120000,
  });
  return resp.data;
}
