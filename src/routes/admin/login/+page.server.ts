import { fail, redirect } from '@sveltejs/kit';
import prisma from "$lib/server/prismadb";
import bcrypt from 'bcrypt'
import { removeSpace } from '$lib/utils/validator'
import { signToken } from '$lib/utils/jwt'

export const load = async ({ locals }) => {
  if (locals.session?.adminId) {
    throw redirect(302, "/admin")
  }

  return {};
}

export const actions = {
  login: async ({ cookies, request, url }) => {
    const data = await request.formData()

    let email: string = removeSpace(data.get('email') as unknown as string || ''),
      password: string = data.get('password') as string || '',
      remember: boolean = data.get('remember') as unknown as boolean || false

    const userData = await prisma.admin.findUnique({
      where: {
        email: email
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true
      }
    })

    if (!userData) {
      return fail(400, { email, remember, error: 'Email not found' });
    }

    if (!await bcrypt.compare(password, userData.password || '')) {
      return fail(400, { email, remember, error: 'Password is corrected' });
    }

    const userWithoutPassword = exclude(userData, ['password'])

    const token = await signToken(userData.id)
    const refreshToken = await signToken(userData.id, remember ? '60d' : '1d')

    // console.log(refreshToken)
    var expiresRefreshToken = new Date();
    expiresRefreshToken.setDate(expiresRefreshToken.getDate() + (remember ? 60 : 1));

    await prisma.verificationToken.create({
      data: {
        identifier: userWithoutPassword.id,
        token: refreshToken,
        expires: expiresRefreshToken
      },
    })

    cookies.set('token_admin', token, { path: '/', httpOnly: true, secure: false, maxAge: 3600 })
    cookies.set('refresh_token_admin', refreshToken, { path: '/', httpOnly: true, secure: false, maxAge: remember ? 2592000 : 86400 })

    throw redirect(302, url.searchParams.get('redirect_url') || "/admin")

    return { success: true }
  },
  register: async (event) => {
    // TODO register the user
  },
  logout: async (event) => {
    const refreshToken = event.cookies.get('refresh_token_admin')

    const deleteUser = await prisma.verificationToken.deleteMany({
      where: {
        token: refreshToken
      },
    })

    event.cookies.delete('token_admin', { path: '/', httpOnly: true, secure: false, })
    event.cookies.delete('refresh_token_admin', { path: '/', httpOnly: true, secure: false, })
    event.locals.session.adminId = null

    // return { success: true }
  }
};

function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  for (let key of keys) {
    delete user[key]
  }
  return user
}