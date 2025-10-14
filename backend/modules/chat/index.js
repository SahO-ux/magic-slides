import express from "express";

import { controllers } from "../../src/modules-loader.js";
import { validateChatPayload } from "./validator.js";

const router = express.Router();

router.post(
  "/",
  validateChatPayload,
  controllers.ChatController.generateSlides
);

export default {
  indexRoute: "/chat",
  router,
};
