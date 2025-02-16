import NextAuth, { Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createUserFolderIfNotExists } from '@/lib/googleDriveUtils';

const prisma = new PrismaClient();

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }
}

const handler = NextAuth({
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Credentials Provider (Email and Password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'your-email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials!;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error('Email or password is incorrect');
        }

        const isValid = await bcrypt.compare(password, user!.password!);
        if (!isValid) {
          throw new Error('Email or password is incorrect');
        }

        return { id: user.id.toString(), name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account, profile, user }) {
      let userId;
      if (account!.provider === 'google') {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile!.email },
        });
    
        if (existingUser) {
          if (!existingUser.password) {
            await prisma.user.update({
              where: { email: profile!.email },
              data: {
                name: profile!.name,
                image: profile!.picture,
              },
            });
          } else {
            return true;
          }
          userId = existingUser.id;
        } else {
          const newUser = await prisma.user.create({
            data: {
              email: profile!.email!,
              name: profile!.name || 'Anonymous',
              role: 'user',
              image: profile!.picture,
              password: null,
            },
          });
          userId = newUser.id;
        }
      }else if (user) {
        userId = user.id;
      }

      if (userId) {
        await createUserFolderIfNotExists(userId.toString());
      }

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: profile!.email },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.sub = dbUser.id.toString();
          token.picture = dbUser.image;
        }
      }
  
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token!.sub!,
        name: token!.name!,
      };
      return session
    }
  }
});

export {handler as GET, handler as POST};