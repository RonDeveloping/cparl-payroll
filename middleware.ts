// This middleware checks for a valid JWT token in the "session" cookie for protected routes (like /dashboard/*). If the token is missing or invalid, it redirects the user to the login page. You can customize the protected routes and the redirection logic as needed.

// middleware.ts (Root of project!)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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
      //new URL(...) ensures it's absolute b/c middleware run before a page's rendered.
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }
  }

  return NextResponse.next();
}
