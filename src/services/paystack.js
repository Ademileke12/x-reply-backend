import fetch from "node-fetch";
import { env } from "../lib/env.js";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function initializeTransaction({ email, amount }) {
  const secret = env("PAYSTACK_SECRET_KEY");
  if (!secret) throw new Error("Missing Paystack secret key");
  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`
    },
    body: JSON.stringify({ email, amount, currency: "NGN", metadata: { source: "x-reply-helper" } })
  });
  const payload = await response.json();
  if (!payload.status) throw new Error(payload.message || "Paystack initialize failed");
  return payload.data;
}

export async function verifyTransaction(reference) {
  const secret = env("PAYSTACK_SECRET_KEY");
  if (!secret) throw new Error("Missing Paystack secret key");
  const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret}` }
  });
  const payload = await response.json();
  if (!payload.status) throw new Error(payload.message || "Paystack verify failed");
  return payload.data;
}
