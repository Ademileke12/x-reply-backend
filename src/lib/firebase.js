import admin from "firebase-admin";
import { env } from "./env.js";

let appInstance = null;

function getServiceAccount() {
  const raw = env("FIREBASE_SERVICE_ACCOUNT", "");
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env variable");
  }
  try {
    // Allow base64-encoded JSON to avoid quoting issues
    const decoded = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
  }
}

export function getFirebaseApp() {
  if (!appInstance) {
    const serviceAccount = getServiceAccount();
    appInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return appInstance;
}

export function getFirestore() {
  return getFirebaseApp().firestore();
}
