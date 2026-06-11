import { hash } from "bcryptjs";

import { prisma } from "@/lib/db/prisma";

const DEV_USER = {
  email: "demo@example.com",
  username: "demo_user",
  name: "Demo User",
  password: "demo12345",
};

export type AppUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export async function getOrCreateDevUser(): Promise<AppUser> {
  const existing = await prisma.user.findFirst({
    where: { email: DEV_USER.email },
    select: { id: true, name: true, email: true, image: true },
  });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: DEV_USER.email,
      username: DEV_USER.username,
      name: DEV_USER.name,
      passwordHash: await hash(DEV_USER.password, 10),
    },
    select: { id: true, name: true, email: true, image: true },
  });
}

export async function getAppUserId(): Promise<string> {
  const devUser = await getOrCreateDevUser();
  return devUser.id;
}

export async function getAppUser(): Promise<AppUser> {
  return getOrCreateDevUser();
}
