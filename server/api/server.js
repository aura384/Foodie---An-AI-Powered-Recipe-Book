import "../config/env.js";
import express from "express";
import cors from "cors";

import authRouter from "../routes/auth.js";
import mealsRouter from "../routes/meals.js";
import chatRouter from "../routes/chat.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/meals", mealsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/auth", authRouter);

// Health check
app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;