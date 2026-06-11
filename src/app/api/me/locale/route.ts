import { NextResponse } from "next/server";
import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { routing } from "@/i18n/routing";

export async function PATCH(req: Request) {
  const userId = await getAppUserId();

  const { locale } = (await req.json()) as { locale?: string };
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { locale },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
