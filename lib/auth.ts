import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { LoginSchema } from "./validations/auth";
import { prisma } from "./prisma";
import { getAuthSecret } from "./auth-secret";

export { getAuthSecret };

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days rolling session
  },
  pages: {
    signIn: "/admin/login",
    signOut: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Agency Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@agency.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate credentials payload with Zod schema
        const validated = LoginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;
        const normalizedEmail = email.toLowerCase().trim();

        // 2. Query PostgreSQL User by normalized email
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        // 3. Reject missing users
        if (!user) {
          return null;
        }

        // 4. Reject inactive users
        if (!user.isActive) {
          return null;
        }

        // 5. Reject users without stored password hash
        if (!user.passwordHash) {
          return null;
        }

        // 6. Verify password strictly against stored bcrypt hash (no hardcoded bypass)
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        // 7. Return verified database user identity
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role?: string }).role || "AGENCY_ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as unknown as { id?: string; role?: string }).id = token.id as string;
        (session.user as unknown as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: getAuthSecret(),
};
