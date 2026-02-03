import bcrypt from 'bcryptjs';
import { parseCookies, serializeCookie } from './cookies';
import { json, isSecureRequest, randomHex } from './utils';

export type Env = {
  DB: D1Database;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function requireAdmin(request: Request, env: Env, opts?: { requireCsrf?: boolean }) {
  const cookies = parseCookies(request);
  const sessionToken = cookies.admin_session;
  if (!sessionToken) return null;

  const session = await env.DB.prepare(
    'SELECT admin_sessions.*, admin_users.email FROM admin_sessions JOIN admin_users ON admin_users.id = admin_sessions.admin_user_id WHERE session_token = ?'
  )
    .bind(sessionToken)
    .first();

  if (!session || !session.expires_at || Date.parse(session.expires_at) < Date.now()) {
    return null;
  }

  if (opts?.requireCsrf) {
    const csrf = request.headers.get('x-csrf-token');
    if (!csrf || csrf !== session.csrf_token) {
      return null;
    }
  }

  return session as any;
}

export async function handleLogin(request: Request, env: Env) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return json({ error: 'Invalid credentials.' }, { status: 400 });
  }

  const user = await env.DB.prepare('SELECT * FROM admin_users WHERE email = ?')
    .bind(body.email)
    .first();
  if (!user) {
    return json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const matches = await bcrypt.compare(body.password, user.password_hash as string);
  if (!matches) {
    return json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const sessionToken = randomHex(24);
  const csrfToken = randomHex(16);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  await env.DB.prepare(
    'INSERT INTO admin_sessions (id, admin_user_id, session_token, csrf_token, expires_at) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(crypto.randomUUID(), user.id, sessionToken, csrfToken, expiresAt)
    .run();

  const secure = isSecureRequest(request);
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    serializeCookie('admin_session', sessionToken, {
      httpOnly: true,
      secure,
      sameSite: 'Strict',
      path: '/',
      maxAge: SESSION_MAX_AGE
    })
  );
  headers.append(
    'Set-Cookie',
    serializeCookie('admin_csrf', csrfToken, {
      httpOnly: false,
      secure,
      sameSite: 'Strict',
      path: '/',
      maxAge: SESSION_MAX_AGE
    })
  );

  return json({ success: true }, { headers });
}

export async function handleLogout(request: Request, env: Env) {
  const session = await requireAdmin(request, env, { requireCsrf: true });
  if (session) {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE session_token = ?')
      .bind(session.session_token)
      .run();
  }
  const secure = isSecureRequest(request);
  const headers = new Headers();
  headers.append('Set-Cookie', serializeCookie('admin_session', '', { httpOnly: true, secure, sameSite: 'Strict', path: '/', maxAge: 0 }));
  headers.append('Set-Cookie', serializeCookie('admin_csrf', '', { httpOnly: false, secure, sameSite: 'Strict', path: '/', maxAge: 0 }));
  return json({ success: true }, { headers });
}

export async function handleSession(request: Request, env: Env) {
  const session = await requireAdmin(request, env);
  if (!session) {
    return json({ error: 'Unauthorized.' }, { status: 401 });
  }
  return json({ email: session.email, csrfToken: session.csrf_token });
}
