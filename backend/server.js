import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";

import { loadModules } from "./src/modules-loader.js";

const app = express();

app.use(cors());
app.use(json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

const startServer = async () => {
  try {
    // 1️⃣ Load all modules (controllers + services + routes)
    await loadModules(app);

    // 2️⃣ Start server
    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () =>
      console.log(`🚀 SERVER LISTENING AT PORT ${PORT} 🚀`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
