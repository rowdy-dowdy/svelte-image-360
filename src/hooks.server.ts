import db from "$lib/server/prismadb";
import { signToken, verifyToken } from "$lib/utils/jwt";
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/admin')) {
    const tokenAdmin = event.cookies.get('token_admin') || "token_admin"

    const decodedAdmin = await verifyToken(tokenAdmin)

    if (decodedAdmin?.payload.sub) {
      event.locals.session = {
        ...event.locals.session,
        adminId: decodedAdmin?.payload.sub
      }
    }
    else {
      // const body = await event.request.json()
      const refresh_token = event.cookies.get('refresh_token_admin')
        // || event.url.searchParams.get('refresh_token') // not use in hook
        || "refresh_token_admin"

      const data_refresh_token = await refreshTokenAdmin(refresh_token)

      if (data_refresh_token) {
        event.locals.session = {
          ...event.locals.session,
          adminId: data_refresh_token.user.id
        }

        event.cookies.set('token_admin', data_refresh_token.token, { path: '/', httpOnly: true, maxAge: 3600 })
      }
      else {
        event.locals.session = {
          ...event.locals.session,
          adminId: null
        }
      }
    }
    
    // if (event.url.pathname.split('/')[1] == "admin" && event.locals.session == null) {
    //   return new Response('Redirect', {status: 303, headers: { Location: '/admin/login' }});
    // }
  }

  const response = await resolve(event)

  return response;
}

const refreshTokenAdmin = async (refresh_token: string) => {
  const refresh_token_db = await db.verificationToken.findFirst({
    where: {
      token: refresh_token,
      expires: {
        gte: new Date()
      }
    }
  })

  if (!refresh_token_db) {
    return null
  }

  const decoded = await verifyToken(refresh_token)

  const user = await db.admin.findUnique({
    where: {
      id: decoded?.payload.sub || "0"
    },
    select: {
      id: true
    }
  })

  if (!user) {
    return null
  }

  const token = await signToken(user.id)

  return {
    user,
    token
  }
}