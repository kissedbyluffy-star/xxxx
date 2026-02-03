const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function rateLimit(ip: string | null) {
  if (!ip) {
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  store.set(ip, entry);
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}
