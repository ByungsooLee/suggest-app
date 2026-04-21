import { NextResponse } from "next/server";

import { auth } from "@/auth";

const protectedPaths = ["/onboarding", "/profile", "/recommend", "/mypage"];

export default auth((request) => {
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));
  const isLoggedIn = Boolean(request.auth?.user);

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/onboarding/:path*", "/profile/:path*", "/recommend/:path*", "/mypage/:path*"],
};
