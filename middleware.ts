import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess, requirePatientOwnership } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/" || pathname === "") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/patients/")) {
    return requirePatientOwnership(request);
  }

  if (pathname.startsWith("/admin")) {
    return requireAdminAccess(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/patients", "/patients/:path*", "/admin", "/admin/:path*"],
};
