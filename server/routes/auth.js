import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../database.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "foodie_secret_key";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required." });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing)
    return res.status(409).json({ error: "An account with this email already exists." });

  const hashed = await bcrypt.hash(password, 10);
  const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, hashed);

  const token = jwt.sign({ id: result.lastInsertRowid, name, email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: result.lastInsertRowid, name, email } });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "All fields are required." });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user)
    return res.status(401).json({ error: "No account found with this email." });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ error: "Incorrect password." });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

export default router;