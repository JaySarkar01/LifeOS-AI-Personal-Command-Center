import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "lifeos-secret-2026-key";
  const token = await getToken({ req, secret });

  const { pathname } = req.nextUrl;

  const isPublicAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";
  const isProtectedRoute = [
    "/dashboard",
    "/tasks",
    "/habits",
    "/notes",
    "/goals",
    "/schedule",
    "/ai",
    "/journal",
    "/finance",
    "/settings",
  ].some((route) => pathname.startsWith(route));

  // If user is authenticated and visits /login, /register, or /, redirect to /dashboard
  if (token && (isPublicAuthPage || isLandingPage)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is unauthenticated and visits a protected route, redirect to /login with callbackUrl
  if (!token && isProtectedRoute) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/tasks/:path*",
    "/habits/:path*",
    "/notes/:path*",
    "/goals/:path*",
    "/schedule/:path*",
    "/ai/:path*",
    "/journal/:path*",
    "/finance/:path*",
    "/settings/:path*",
  ],
};
