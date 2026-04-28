"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn } from "@/auth";
import { prisma } from "@/lib/db/prisma";

const RegisterSchema = z.object({
  email: z.string().trim().email(),
  username: z.string().trim().min(3).max(30),
  name: z.string().trim().min(1).max(50),
  password: z.string().min(8).max(100),
});

const LoginSchema = z.object({
  email: z.string().trim().email(),
  username: z.string().trim().min(3).max(30),
  password: z.string().min(8).max(100),
});

function getString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

export async function registerAction(formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    email: getString(formData, "email"),
    username: getString(formData, "username"),
    name: getString(formData, "name"),
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    redirect("/login?error=register_validation");
  }

  const duplicatedUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }],
    },
    select: { id: true },
  });

  if (duplicatedUser) {
    redirect("/login?error=user_exists");
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      name: parsed.data.name,
      passwordHash,
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    username: parsed.data.username,
    password: parsed.data.password,
    redirectTo: "/onboarding",
  });
}

export async function loginAction(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: getString(formData, "email"),
    username: getString(formData, "username"),
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    redirect("/login?error=login_validation");
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid_credentials");
    }
    throw error;
  }
}
