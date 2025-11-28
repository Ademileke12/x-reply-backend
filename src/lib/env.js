import dotenv from "dotenv";

let initialized = false;

export function ensureEnv() {
  if (initialized) return;
  dotenv.config();
  initialized = true;
}

export function env(key, fallback = "") {
  ensureEnv();
  return process.env[key] || fallback;
}
