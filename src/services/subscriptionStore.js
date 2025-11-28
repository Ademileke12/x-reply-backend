import { getFirestore } from "../lib/firebase.js";

const db = getFirestore();
const COLLECTION = "subscriptions";

const normalizeEmail = email => (email ? email.trim().toLowerCase() : "");

export async function getSubscription(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const doc = await db.collection(COLLECTION).doc(normalized).get();
  return doc.exists ? doc.data() : null;
}

export async function upsertSubscription(email, payload) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const ref = db.collection(COLLECTION).doc(normalized);
  await ref.set({ ...payload, email: normalized }, { merge: true });
  const snapshot = await ref.get();
  return snapshot.data();
}
