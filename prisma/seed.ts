import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const ownerCount = await prisma.user.count({ where: { role: Role.OWNER } });
  if (ownerCount > 0) {
    console.log("Owner already initialized; skipping bootstrap.");
    return;
  }

  const username = process.env.OWNER_USERNAME?.trim();
  const password = process.env.OWNER_PASSWORD;
  const displayName = process.env.OWNER_DISPLAY_NAME?.trim() || "DEALERS OWNER";

  if (!username || !password || password.length < 12) {
    throw new Error("Initial setup requires OWNER_USERNAME and OWNER_PASSWORD (at least 12 characters). Configure them in Netlify environment variables.");
  }
  if (!/^[a-zA-Z0-9_.-]{3,80}$/.test(username)) {
    throw new Error("OWNER_USERNAME must be 3-80 characters: letters, numbers, dot, underscore or hyphen.");
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new Error("OWNER_USERNAME is already used by another account. Choose a unique username; no role will be changed automatically.");
  }

  await prisma.user.create({
    data: {
      username,
      displayName,
      passwordHash: await bcrypt.hash(password, 12),
      role: Role.OWNER,
      active: true,
    },
  });
  console.log("Initial Owner account created successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
