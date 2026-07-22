export const PATIENT_SESSION_COOKIE = "patient_session";
export const ADMIN_SESSION_COOKIE = "admin_session";

function buildCookieString(name: string, value: string, maxAge = 86400) {
  const parts = [`${name}=${value}`, `Path=/`, `Max-Age=${maxAge}`, `SameSite=Lax`];

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function setPatientSessionCookie(userId: string, email: string) {
  const payload = `${encodeURIComponent(userId)}::${encodeURIComponent(email)}`;
  document.cookie = buildCookieString(PATIENT_SESSION_COOKIE, payload);
}

export function setAdminSessionCookie() {
  document.cookie = buildCookieString(ADMIN_SESSION_COOKIE, "true");
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;

  document.cookie = `${PATIENT_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
