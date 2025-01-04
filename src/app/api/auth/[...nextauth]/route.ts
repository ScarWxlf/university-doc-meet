import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // Credentials Provider (Email and Password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'your-email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Find user in database
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error('No user found with this email');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // Return user object
        return { id: user.id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  pages: {
    signIn: '/signin', // Custom sign-in page
  },
  session: {
    strategy: 'jwt', // Use JWT for session
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export {handler as GET, handler as POST};