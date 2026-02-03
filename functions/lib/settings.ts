import { Env } from './admin';

export async function getSettings(env: Env) {
  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  const settings: Record<string, any> = {};
  results?.forEach((row: any) => {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  });
  return settings;
}

export async function upsertSettings(env: Env, updates: Record<string, unknown>) {
  const entries = Object.entries(updates);
  const stmt = env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const batch = entries.map(([key, value]) => stmt.bind(key, JSON.stringify(value)));
  if (batch.length) {
    await env.DB.batch(batch);
  }
}
