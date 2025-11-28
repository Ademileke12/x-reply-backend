import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "subscriptions.json");

let cache = new Map();
let loaded = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadFromDisk() {
  if (loaded) return;
  ensureDataDir();
  if (fs.existsSync(FILE_PATH)) {
    try {
      const raw = fs.readFileSync(FILE_PATH, "utf8");
      const data = JSON.parse(raw);
      cache = new Map(Object.entries(data));
    } catch (error) {
      console.warn("[subscriptions] failed to load", error);
    }
  }
  loaded = true;
}

function saveToDisk() {
  ensureDataDir();
  const obj = Object.fromEntries(cache);
  fs.writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2), "utf8");
}

export function getSubscription(email) {
  if (!email) return null;
  loadFromDisk();
  return cache.get(email.toLowerCase()) || null;
}

export function upsertSubscription(email, payload) {
  if (!email) return null;
  loadFromDisk();
  const key = email.toLowerCase();
  const next = { ...(cache.get(key) || {}), ...payload, email: key };
  cache.set(key, next);
  saveToDisk();
  return next;
}
