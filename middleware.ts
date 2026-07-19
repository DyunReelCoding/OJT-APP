import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess, requirePatientOwnership } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect patient routes
  if (pathname.startsWith("/patients/")) {
    return requirePatientOwnership(request);
  }

  // Protect admin routes
  // Allow the admin unauthorized page to be shown without an admin cookie
  if (pathname.startsWith("/admin/unauthorized")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return requireAdminAccess(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/patients/:path*",
    "/admin/:path*",
  ],
};