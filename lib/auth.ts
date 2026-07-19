import { NextRequest, NextResponse } from "next/server";

export const PATIENT_SESSION_COOKIE = "patient_session";
export const ADMIN_SESSION_COOKIE = "admin_session";

export interface PatientSession {
  userId: string;
  email: string;
}

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parsePatientSessionCookie(cookieHeader?: string | null): PatientSession | null {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";").map((item) => item.trim());
  const cookieValue = parts.find((item) => item.startsWith(`${PATIENT_SESSION_COOKIE}=`));

  if (!cookieValue) return null;

  const rawValue = cookieValue.slice(`${PATIENT_SESSION_COOKIE}=`.length);
  const decoded = decodeCookieValue(rawValue);
  const [userId, email] = decoded.split("::");

  if (!userId || !email) return null;

  return { userId, email };
}

export function requirePatientOwnership(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "patients" || segments.length < 2) {
    return NextResponse.next();
  }

  const requestedUserId = segments[1];
  const session = parsePatientSessionCookie(request.headers.get("cookie") ?? undefined);

  if (!session || session.userId !== requestedUserId) {
    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export function requireAdminAccess(request: NextRequest) {
  const hasAdminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value === "true";

  if (!hasAdminCookie) {
    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Redirect to a friendly unauthorized page instead of the public root.
    return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
  }

  return NextResponse.next();
}
