import { redirect } from '@sveltejs/kit';

export const load = async ({locals}) => {
  if (locals.session?.adminId) {
    // throw redirect(302, "/admin")
  }

  return {}
}