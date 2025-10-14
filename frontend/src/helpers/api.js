import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081";

/**
 * Send a prompt to backend.
 * - prompt: string
 * - context: object (current slides JSON or any extra context)
 */
export async function sendPrompt(prompt, context = {}) {
  const payload = { prompt, context: context || {} };

  try {
    const resp = await axios.post(`${API_BASE}/chat`, payload, {
      timeout: 120000,
    });
    // on 2xx axios resolves and resp.data holds server json
    return resp.data;
  } catch (err) {
    // If server responded with JSON (non-2xx), axios attaches it at err.response.data
    if (err?.response && err.response?.data) {
      // Return server payload so frontend can handle structured errors like model_truncated
      return err.response.data;
    }
    // Network / timeout / CORS error (no response) — rethrow so caller can show a generic error
    throw err;
  }
}
