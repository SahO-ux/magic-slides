import { GoogleGenAI } from "@google/genai";
import {
  genAIResponseMapper,
  generateConfig,
  parseJsonSafe,
  systemPrompt,
} from "./constants.js";
import { HttpError } from "../../src/httpError.js";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-pro-preview-05-06";

// Initialize Gemini client ONCE globally
const client = new GoogleGenAI({ apiKey });

const generateSlides = async (req) => {
  try {
    const { prompt, context } = req.body ?? {};

    // Guard prompt validation for safety
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      throw new HttpError(400, {
        error: "prompt_required",
        message: "Please provide a prompt.",
      });
    }

    if (!apiKey) {
      throw new HttpError(500, {
        error: "api_key_missing",
        message: "GEMINI_API_KEY not configured on the server.",
      });
    }

    const combinedPrompt = `${systemPrompt}\n\nCurrent Slides (JSON):${JSON.stringify(
      context || {}
    )}\n\nUser Prompt:${prompt}\n\nReturn ONLY the updated slides JSON (no extra commentary).`;

    // Gemini-compatible request format

    const sdkResp = await client.models.generateContent({
      model,
      // contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
      contents: combinedPrompt,
      config: generateConfig,
    });

    const mapped = genAIResponseMapper(sdkResp);

    // If model truncated (no full JSON), handle gracefully — no auto-retry
    if (!mapped.ok && mapped.truncated) {
      // Return structured response to FE (no PPT generation attempted)

      throw new HttpError(422, {
        error: "model_truncated",
        message:
          "Model hit maximum token limit and the full presentation could not be generated.",
        reason: mapped.finishReason || "MAX_TOKENS",
        truncated: true,
        partialSlidesJson: null, // explicitly null to indicate no partial content
        // include usage or sdkResp for debugging (optional)
        usage: mapped.sdkResp?.usageMetadata || null,
        // sdkResp: mapped.sdkResp, // for dev purpose
      });
    }

    // Normal case: mapped.ok === true
    if (mapped.ok) {
      // parse the full returned text into JSON (throws if invalid)
      const slidesJson = parseJsonSafe(mapped.text);
      if (slidesJson) slidesJson.usage = mapped.sdkResp?.usageMetadata || null;
      return slidesJson || {};
    }

    // Unexpected: not truncated but not ok
    throw new HttpError(500, {
      error: mapped.error || "unexpected_model_response",
      message: "Unexpected model response shape.",
    });
  } catch (err) {
    // preserve and rethrow HttpError so controller can use its status/body
    if (err instanceof HttpError) throw err;

    // Log and wrap unexpected errors
    console.error(
      "generateSlides service error:",
      err?.response?.data || err.message || err
    );
    throw new HttpError(500, {
      error: "internal_server_error",
      message: "Internal server error",
    });
  }
};

export default {
  serviceName: "ChatService",
  generateSlides,
};
