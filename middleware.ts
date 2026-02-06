// middleware.ts (Root of project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/utils/user/session";
import { jwtVerify } from "jose";
import { ROUTES } from "@/constants/routes";

//TODO: Move this secret to an environment variable and ensure it's a secure, random value in production

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "a_very_long_random_string_here",
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  const path = request.nextUrl.pathname;

  // 1. If trying to access dashboard without a token, redirect to login
  if (
    path.startsWith(ROUTES.DASHBOARD.HOME) ||
    path.startsWith(ROUTES.DASHBOARD.SETTINGS)
  ) {
    if (!token) {
      console.log("❌ Redirecting to login: No token found");
      //new URL(...) ensures it's absolute b/c middleware run before a page's rendered.
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      console.log("✅ Token verified for dashboard");
      return NextResponse.next();
    } catch (err) {
      console.log("❌ Redirecting to login: Token invalid", err);
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }
  }
  // const isProtectedRoute =
  //   path.startsWith("/dashboard") || path.startsWith("/payroll");

  // const cookie = request.cookies.get("session")?.value;
  // const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  // if (isProtectedRoute && !session) {
  //   return NextResponse.redirect(new URL("/login", request.nextUrl));
  // }

  return NextResponse.next();
}
