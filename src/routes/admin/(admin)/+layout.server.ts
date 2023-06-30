import { getCurrentUser } from '$lib/server/getCurrentUser.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({locals}) => {
  const user = await getCurrentUser(locals.session?.adminId)

  if (!user) {
    throw redirect(302, "/admin/login")
  }

  return {
    user
  }
}