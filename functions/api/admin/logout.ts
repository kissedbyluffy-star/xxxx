import { handleLogout } from '../../lib/admin';
import type { Env } from '../../lib/admin';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => handleLogout(request, env);
