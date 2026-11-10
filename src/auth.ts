import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
 session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
 pages: { signIn: "/login" },
 providers: [Credentials({ credentials: { username: {}, password: {} }, async authorize(credentials) {
  const parsed = z.object({username:z.string().min(1),password:z.string().min(1)}).safeParse(credentials);
  if (!parsed.success) return null;
  const user = await db.user.findUnique({where:{username:parsed.data.username}});
  if (!user || !user.active || !(await bcrypt.compare(parsed.data.password,user.passwordHash))) return null;
  return {id:user.id,name:user.displayName,role:user.role};
 }})],
 callbacks: {
  async jwt({token,user}) { if(user) token.userId=user.id; return token; },
  async session({session,token}) { if (session.user) session.user.id=String(token.userId ?? ""); return session; }
 }
});
