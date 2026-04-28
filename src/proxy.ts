import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { routing } from "@/i18n/routing";

const protectedPaths = ["/onboarding", "/profile", "/recommend", "/mypage"];
const intlMiddleware = createMiddleware(routing);

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const locale = routing.locales.find((entry) => pathname === `/${entry}` || pathname.startsWith(`/${entry}/`));
  const pathnameWithoutLocale = locale ? pathname.replace(`/${locale}`, "") || "/" : pathname;
  const isProtected = protectedPaths.some((path) => pathnameWithoutLocale.startsWith(path));
  const isLoggedIn = Boolean(request.auth?.user);

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale ?? routing.defaultLocale}/login`, request.url));
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
