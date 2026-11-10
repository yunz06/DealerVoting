import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
export const metadata: Metadata={title:"DEALERS | Internal Voting",description:"Private voting system for DEALERS"};
export default async function RootLayout({children}:{children:React.ReactNode}) {
 const session=await auth();
 const user=session?.user?.id ? await db.user.findUnique({where:{id:session.user.id},select:{active:true,role:true,displayName:true}}) : null;
 return <html lang="vi"><body className="font-sans"><header className="border-b border-white/10 bg-black/50 backdrop-blur-md"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3"><Link href="/" className="relative block h-14 w-48"><Image src="/dealers-logo.png" alt="DEALERS original logo" fill priority className="object-contain" sizes="192px" /></Link>{user?.active&&<nav className="flex items-center gap-5 text-[11px] uppercase tracking-widest text-zinc-300"><Link href="/">Overview</Link><Link href="/polls">Voting</Link>{(user.role==="ADMIN"||user.role==="OWNER")&&<Link href="/admin">Admin</Link>}{user.role==="OWNER"&&<Link href="/owner/admins">Admin accounts</Link>}<form action={async()=>{"use server";await signOut({redirectTo:"/login"});}}><button>Logout</button></form></nav>}</div></header><main className="mx-auto min-h-[calc(100vh-160px)] max-w-6xl px-5 py-12">{children}</main><footer className="border-t border-white/10 py-6 text-center text-[10px] tracking-[.3em] text-zinc-600">DEALERS · PRIVATE INTERNAL VOTING</footer></body></html>;
}
