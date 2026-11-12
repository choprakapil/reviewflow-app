import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { LoginSchema } from "./validations/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days rolling session
  },
  pages: {
    signIn: "/admin/login",
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
        const validated = LoginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

        // In production/Phase 3, this queries the PostgreSQL User table.
        // For local development and bootstrap testing, fallback to verified admin account.
        const defaultAdminEmail = process.env.ADMIN_EMAIL || "admin@reviewflow.io";
        const defaultAdminPassword = process.env.ADMIN_PASSWORD || "AdminPass123!";

        if (email.toLowerCase() === defaultAdminEmail.toLowerCase()) {
          const isValid = await bcrypt.compare(password, await bcrypt.hash(defaultAdminPassword, 10));
          if (isValid || password === defaultAdminPassword) {
            return {
              id: "usr_agency_admin_001",
              name: "Super Agency Admin",
              email: defaultAdminEmail,
              role: "SUPER_ADMIN",
            };
          }
        }

        return null;
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
  secret: process.env.NEXTAUTH_SECRET || "dev-insecure-secret-for-local-testing-only-replace-in-production-12345",
};

