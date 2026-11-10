import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, displayName: true, role: true, active: true },
  });
  if (!user || !user.active) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "OWNER") notFound();
  return user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (user.role !== "OWNER") notFound();
  return user;
}

export function isOpen(poll: { status: string; startAt: Date | null; endAt: Date | null }) {
  const now = new Date();
  return poll.status === "OPEN" && (!poll.startAt || poll.startAt <= now) && (!poll.endAt || poll.endAt > now);
}
