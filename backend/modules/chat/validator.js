import { chatPromptSchema } from "./validation-schemas.js";

export function validateChatPayload(req, res, next) {
  const { error, value } = chatPromptSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ error: "Invalid Chat Payload", details: error.details });
  }
  req.body = value;
  next();
}
