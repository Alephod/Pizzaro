import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { PrismaClient } from '@/generated/prisma/index.js';
import bcrypt from 'bcrypt';
import type { JWT } from 'next-auth/jwt';

const prisma = new PrismaClient();

type UserFromAuthorize = {
    id: string;
    username: string;
};

type AdminJWT = JWT & {
    id?: string;
    username?: string;
};

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'admin-credentials',
            name: 'Admin Login',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;
                const user = await prisma.adminUser.findUnique({
                    where: { username: credentials.username },
                });
                if (!user) return null;
                const valid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!valid) return null;
                return {
                    id: user.id.toString(),
                    username: user.username,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 60,
    },
    jwt: {
        maxAge: 30 * 60,
    },
    pages: { signIn: '/admin/login' },
    callbacks: {
        async jwt({ token, user }) {
            const userToken = token as AdminJWT;

            if (user && typeof (user as UserFromAuthorize).id !== 'undefined' && typeof (user as UserFromAuthorize).username !== 'undefined') {
                const u = user as UserFromAuthorize;
                userToken.id = u.id;
                userToken.username = u.username;
            }

            return userToken;
        },

        async session({ session, token }) {
            const userToken = token as AdminJWT;

            session.user.id = userToken.id;
            session.user.username = userToken.username ?? session.user.name ?? null;

            return session;
        },
    },
};
