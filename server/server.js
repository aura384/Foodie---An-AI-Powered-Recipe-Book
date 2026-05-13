import "./config/env.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import mealsRouter from "./routes/meals.js";
import chatRouter from "./routes/chat.js";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/meals", mealsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/auth", authRouter);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});