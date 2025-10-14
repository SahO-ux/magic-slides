// Basic prompt wrapper instructing model to return JSON for slides

const systemPrompt = `
You are an AI assistant that generates and edits structured slide decks in JSON format.

Always return ONLY valid JSON, following this structure exactly:
{
  "title": "Presentation title",
  "slides": [
    { "title": "Slide 1 title", "bullets": ["a", "b"], "image": null },
    ...
  ]
}

Rules:
- When NO existing slides are provided (first prompt), create a NEW deck with 5–7 slides by default and if user specifies to create more than 7 slides or pages, simply generate 7 and not more than that in any case.
- When existing slides are provided (context), MODIFY that JSON based on the user's new instructions:
  - Add, edit, or remove slides or bullets as requested.
  - Maintain consistent JSON structure.
  - Preserve existing slides unless explicitly told to remove or change them.
  - At any time there should not be more than 7 slides and if any user prompt specifies or results in creating more than 7 slides or pages, simply generate 7 and not more than that in any case.
- Never include explanations, notes, or extra text outside the JSON.
`;

const generateConfig = {
  // For some varied but still focused O/Ps
  temperature: Number(process.env.GEMINI_TEMPERATURE) ?? 0.2,

  // 1500 tokens ≈ 1000–1200 words roughly (>=10 pages)
  maxOutputTokens: Number(process.env.GEMINI_MAX_TOKENS) || 1500,

  responseMimeType: "application/json",

  thinkingConfig: {
    thinkingBudget: 0, // Disables thinking
  },
};

/**
 * Map SDK response to a structured result.
 * Returns:
 *  { ok: true, text: '...', truncated: false, finishReason: null, sdkResp }
 *  or
 *  { ok: false, error: 'model_truncated'|'unexpected_shape'|..., truncated: boolean, finishReason, text?: string|null, sdkResp }
 */
const genAIResponseMapper = (sdkResp = null) => {
  try {
    if (!sdkResp) {
      return {
        ok: false,
        error: "empty_sdk_response",
        truncated: false,
        sdkResp: null,
      };
    }

    // Normalize candidate (some SDK shapes)
    const candidate = sdkResp?.candidates?.[0] ?? sdkResp?.output?.[0] ?? null;
    const finishReason = candidate?.finishReason ?? null;

    // If finish reason indicates truncation, surface that immediately
    if (
      finishReason &&
      typeof finishReason === "string" &&
      finishReason.toUpperCase().includes("MAX_TOKENS")
    ) {
      // try extract partial text if present
      const partialText =
        sdkResp?.candidates?.[0]?.content?.parts?.[0]?.text ??
        sdkResp?.output?.[0]?.content?.[0]?.text ??
        sdkResp?.text ??
        sdkResp?.response?.text ??
        null;

      return {
        ok: false,
        error: "model_truncated",
        truncated: true,
        finishReason,
        text: partialText,
        sdkResp,
      };
    }

    // Normal extraction paths (non-truncated)
    if (sdkResp?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        ok: true,
        text: sdkResp.candidates[0].content.parts[0].text,
        truncated: false,
        finishReason: null,
        sdkResp,
      };
    }

    if (sdkResp?.output?.[0]?.content?.[0]?.text) {
      return {
        ok: true,
        text: sdkResp.output[0].content[0].text,
        truncated: false,
        finishReason: null,
        sdkResp,
      };
    }

    if (typeof sdkResp.text === "string") {
      return {
        ok: true,
        text: sdkResp.text,
        truncated: false,
        finishReason: null,
        sdkResp,
      };
    }

    if (sdkResp?.response?.text) {
      return {
        ok: true,
        text: sdkResp.response.text,
        truncated: false,
        finishReason: null,
        sdkResp,
      };
    }

    // fallback: unexpected shape (no text)
    return {
      ok: false,
      error: "unexpected_shape",
      truncated: false,
      finishReason: null,
      text: JSON.stringify(sdkResp, null, 2),
      sdkResp,
    };
  } catch (err) {
    return {
      ok: false,
      error: "mapper_failed",
      message: String(err),
      truncated: false,
      sdkResp,
    };
  }
};

/**
 * Safely parse text that is expected to contain JSON.
 * - Handles JSON wrapped in markdown fences (```json ... ```)
 * - Attempts to extract first {...} or [...] substring and parse it
 *
 * Throws Error when parsing fails.
 *
 * @param {string} text
 * @returns {any} parsed JSON (object or array)
 */

const parseJsonSafe = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Expected string input for JSON parsing");
  }

  // 1) Trim and strip code fences (```json ... ```)
  let s = text.trim();
  const fenceMatch = s.match(/```(?:json)?\n?([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    s = fenceMatch[1].trim();
  }

  // 2) Fast path: try direct JSON.parse for object or array
  try {
    return JSON.parse(s);
  } catch {
    // fallthrough
  }

  // 3) Try to extract a fully closed array or object and parse it
  const arrayMatch = s.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      // fallthrough
    }
  }

  const objectMatch = s.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // fallthrough
    }
  }

  // 4) Nothing parseable
  const snippet = String(s).slice(0, 300);
  throw new Error("AI did not return valid JSON. Snippet: " + snippet);
};

export { systemPrompt, genAIResponseMapper, parseJsonSafe, generateConfig };
