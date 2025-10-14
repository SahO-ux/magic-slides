import { services } from "../../src/modules-loader.js";
import { HttpError } from "../../src/httpError.js";

const generateSlides = async (req, res) => {
  try {
    const slides = await services.ChatService.generateSlides(req);
    res.json(slides);
  } catch (err) {
    console.error("generateSlides controller error:", err);

    if (err instanceof HttpError) {
      // Use structured error body from the HttpError
      const status = err.status || 500;
      const body = err.body || { error: "internal_error" };
      return res.status(status).json(body);
    }

    // Generic fallback
    return res.status(500).json({ error: "internal server error" });
  }
};

export default {
  controllerName: "ChatController",
  generateSlides,
};
