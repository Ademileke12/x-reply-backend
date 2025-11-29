import { Router } from "express";
import { getSubscription } from "../services/subscriptionStore.js";
import { generateReply } from "../services/groq.js";

const router = Router();

router.post("/", async (req, res) => {
  const { email, text, tone } = req.body || {};
  if (!email || !text || !tone) {
    return res.status(400).json({ error: "email, text, and tone are required" });
  }
  const sub = await getSubscription(email);
  if (!sub?.expiresAt || Date.now() >= sub.expiresAt) {
    return res.status(402).json({ error: "Subscription inactive" });
  }
  try {
    const reply = await generateReply({ text, tone });
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to generate reply" });
  }
});

export default router;
