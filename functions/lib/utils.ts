export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for');
  if (!forwarded) return null;
  return forwarded.split(',')[0].trim();
}

export function randomHex(bytes: number) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function isSecureRequest(request: Request) {
  return request.url.startsWith('https://');
}
