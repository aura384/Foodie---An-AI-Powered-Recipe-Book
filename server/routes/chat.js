import dotenv from "dotenv";
dotenv.config({ path: "../.env" });   // 👈 ensure env is loaded BEFORE using it

import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

// 🔍 Debug (you can remove later)
console.log("ENV CHECK:", process.env.GROQ_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are Rey, a warm, friendly, and knowledgeable food assistant for Foodie — a recipe discovery app.

Your personality:
- Cheerful, encouraging, and passionate about food
- Concise but helpful — keep replies short and scannable (2–4 sentences max unless a recipe is requested)
- Use the occasional food emoji to keep things fun 🍳
- Never robotic — feel like a friend who loves cooking

You help users with:
- Finding recipes by ingredient, cuisine, or dietary need
- Cooking tips, substitutions, and techniques
- Explaining what a dish is or where it's from
- General food questions

If asked something totally unrelated to food, gently steer back: "I'm best with food stuff! But I can try to help 😄"

Always sign off suggestions with encouragement.`;

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    });

    const reply =
      completion.choices[0]?.message?.content || "Hmm, try again! 🙈";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;