import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
 adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
 providers: [
 GoogleProvider({
 clientId: process.env.GOOGLE_CLIENT_ID!,
 clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
 }),
 CredentialsProvider({
 name: "Credentials",
 credentials: {
 email: { label: "Email", type: "email" },
 password: { label: "Password", type: "password" },
 },
 async authorize(credentials) {
 if (!credentials?.email || !credentials?.password) {
 return null;
 }

 const user = await prisma.user.findUnique({
 where: { email: credentials.email },
 });

 if (!user || !user.password) {
 return null;
 }

 const isPasswordValid = await bcrypt.compare(
 credentials.password,
 user.password
 );

 if (!isPasswordValid) {
 return null;
 }

 return {
 id: user.id,
 email: user.email,
 name: user.name,
 image: user.image,
 };
 },
 }),
 ],
 callbacks: {
 async signIn() {
 return true;
 },
 async jwt({ token, user, account, profile }) {
 if (account && user) {
 token.sub = user.id;
 token.picture = user.image;
 token.name = user.name;
 token.email = user.email;
 }
 if (profile) {
 token.picture = (profile as { picture?: string }).picture || token.picture;
 }
 return token;
 },
 async session({ session, token }) {
 if (session.user) {
 session.user.id = token.sub as string;
 session.user.image = token.picture as string | null;
 session.user.name = token.name as string | null;
 session.user.email = token.email as string | null;

 if (token.sub) {
 const dbUser = await prisma.user.findUnique({
 where: { id: token.sub },
 select: { university: true, image: true },
 });

 if (dbUser) {
 session.user.university = dbUser.university;
 session.user.image = dbUser.image || (token.picture as string | null);
 }
 }
 }
 return session;
 },
 },
 pages: {
 signIn: "/auth/signin",
 error: "/auth/error",
 },
 session: {
 strategy: "jwt",
 },
};
