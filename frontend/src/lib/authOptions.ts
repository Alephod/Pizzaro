import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { PrismaClient } from '@/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
        const user = await prisma.adminUser.findUnique({ where: { username: credentials.username } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id.toString(), username: user.username };
      },
    }),
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 2 * 60, // Токен живет 2 минуты
   },
   jwt: {
    maxAge: 2 * 60, 
   },
   pages: { signIn: '/admin/login' },
  
};