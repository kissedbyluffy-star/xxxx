import { handleSession } from '../../lib/admin';
import type { Env } from '../../lib/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => handleSession(request, env);
