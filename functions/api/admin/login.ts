import { handleLogin } from '../../lib/admin';
import type { Env } from '../../lib/admin';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => handleLogin(request, env);
