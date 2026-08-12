import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db/mongoose";
import { UserModel } from "@/models/mongoose/User";
import { comparePassword } from "@/lib/auth/password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();
        const userDoc = await UserModel.findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!userDoc || !userDoc.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isValid = await comparePassword(credentials.password, userDoc.passwordHash);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: userDoc._id.toString(),
          email: userDoc.email,
          name: userDoc.name || userDoc.email.split("@")[0],
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "lifeos-secret-2026-key",
};
