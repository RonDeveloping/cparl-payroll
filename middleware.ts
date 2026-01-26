// middleware.ts (Root of project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/utils/user/session";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute =
    path.startsWith("/dashboard") || path.startsWith("/payroll");

  const cookie = request.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}
