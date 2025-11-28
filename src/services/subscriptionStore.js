const subscriptions = new Map();

export function getSubscription(email) {
  if (!email) return null;
  return subscriptions.get(email.toLowerCase()) || null;
}

export function upsertSubscription(email, payload) {
  if (!email) return null;
  const normalized = email.toLowerCase();
  const current = subscriptions.get(normalized) || {};
  const next = { ...current, ...payload, email: normalized };
  subscriptions.set(normalized, next);
  return next;
}
