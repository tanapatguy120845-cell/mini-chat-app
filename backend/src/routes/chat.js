import express from "express";
import axios from "axios";
import Message from "../models/Message.js";

const router = express.Router();

// ✅ NEW: get chat history
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// existing: send message
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.length > 500) {
      return res.status(400).json({ error: "Invalid message" });
    }

    const userMsg = await Message.create({
      role: "user",
      content: message,
    });

    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "llama3",
      messages: [{ role: "user", content: message }],
      stream: false,
    });

    const aiContent = response.data.message.content;

    const aiMsg = await Message.create({
      role: "ai",
      content: aiContent,
    });

    res.json({ user: userMsg, ai: aiMsg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI not responding" });
  }
});

export default router;
