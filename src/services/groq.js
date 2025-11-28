import fetch from "node-fetch";
import { env } from "../lib/env.js";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export async function generateReply({ text, tone }) {
  const apiKey = env("GROQ_API_KEY");
  if (!apiKey) throw new Error("Missing Groq API key");
  const body = {
    model: "groq/compound-mini",
    messages: [
      {
        role: "system",
        content:
          "You are X Reply Helper, a concise but human responder. Write one sentence (<=30 words) in the requested tone, referencing tweet details."
      },
      { role: "user", content: `Tone: ${tone}\nTweet: ${text}` }
    ],
    temperature: 0.6,
    max_tokens: 80
  };
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || "Groq request failed");
  }
  return payload?.choices?.[0]?.message?.content?.trim() || "";
}
