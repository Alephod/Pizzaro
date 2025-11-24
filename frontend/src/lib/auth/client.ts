import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

type UserFromAuthorize = {
  id: string;
  email: string;
};

type ClientJWT = JWT & {
  id?: string;
  email?: string;
};

export const clientAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'otp',
      name: 'Email OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null;

        // проверяем код в базе
        const record = await prisma.otpCode.findUnique({
          where: { email: credentials.email },
        });

        if (!record) return null;

        const now = new Date();
        if (record.expiresAt < now) return null;
        if (record.code !== credentials.code) return null;

        // удалить использованный код
        await prisma.otpCode.delete({
          where: { email: credentials.email },
        });

        // найти или создать пользователя
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { email: credentials.email, data: {} },
          });
        }

        return { id: user.id.toString(), email: user.email } as UserFromAuthorize;
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 дней 
  jwt: { maxAge: 30 * 24 * 60 * 60 },

  cookies: {
    sessionToken: {
      name: 'next-auth.client.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      const t = token as ClientJWT;
      if (user) {
        const u = user as UserFromAuthorize;
        t.id = u.id;
        t.email = u.email;
      }
      return t;
    },

    async session({ session, token }) {
      const t = token as ClientJWT;

      const normalizedEmail =
        typeof t.email === 'string' ? t.email : typeof session.user?.email === 'string' ? session.user.email : undefined;

      const newUser: Session['user'] = {
        ...session.user,
        id: t.id,
        email: normalizedEmail,
      };

      session.user = newUser;
      return session;
    },
  },
};
