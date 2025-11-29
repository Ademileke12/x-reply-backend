import { Router } from "express";
import { getSubscription, upsertSubscription } from "../services/subscriptionStore.js";
import { initializeTransaction, verifyTransaction } from "../services/paystack.js";
import { env } from "../lib/env.js";

const router = Router();
const PLAN_AMOUNT = Number(env("PAYSTACK_PLAN_AMOUNT", "350000"));
const PLAN_LABEL = env("PAYSTACK_PLAN_NAME", "AI Reply Plan");
const SUBSCRIPTION_DURATION_MS = 21 * 24 * 60 * 60 * 1000;

const normalizeEmail = email => (email ? email.trim().toLowerCase() : "");

router.post("/status", async (req, res) => {
  const rawEmail = req.body?.email;
  const email = normalizeEmail(rawEmail);
  if (!email) return res.status(400).json({ error: "Email is required" });
  const sub = (await getSubscription(email)) || {};
  const active = Boolean(sub.expiresAt && Date.now() < sub.expiresAt);
  res.json({
    email,
    active,
    expiresAt: sub.expiresAt || null,
    pendingReference: sub.pendingReference || null,
    amount: PLAN_AMOUNT,
    label: PLAN_LABEL
  });
});

router.post("/initialize", async (req, res) => {
  const rawEmail = req.body?.email;
  const email = normalizeEmail(rawEmail);
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const tx = await initializeTransaction({ email, amount: PLAN_AMOUNT });
    await upsertSubscription(email, { email, pendingReference: tx.reference });
    res.json({ authorizationUrl: tx.authorization_url, reference: tx.reference });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to start payment" });
  }
});

router.post("/confirm", async (req, res) => {
  const rawEmail = req.body?.email;
  const email = normalizeEmail(rawEmail);
  if (!email) return res.status(400).json({ error: "Email is required" });
  const sub = await getSubscription(email);
  if (!sub?.pendingReference) {
    return res.status(400).json({ error: "No pending transaction. Start payment first." });
  }
  try {
    const tx = await verifyTransaction(sub.pendingReference);
    if (tx.status !== "success") {
      return res.status(400).json({ error: `Payment status: ${tx.status}` });
    }
    const expiresAt = Date.now() + SUBSCRIPTION_DURATION_MS;
    await upsertSubscription(email, {
      email,
      expiresAt,
      pendingReference: null,
      lastReference: tx.reference
    });
    res.json({ email, expiresAt });
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to verify payment" });
  }
});
export default router;
