export const PATIENT_SESSION_COOKIE = "patient_session";
export const ADMIN_SESSION_COOKIE = "admin_session";

export function setPatientSessionCookie(userId: string, email: string) {
  const payload = `${encodeURIComponent(userId)}::${encodeURIComponent(email)}`;
  document.cookie = `${PATIENT_SESSION_COOKIE}=${payload}; Path=/; Max-Age=86400; SameSite=Lax`;
}

export function setAdminSessionCookie() {
  document.cookie = `${ADMIN_SESSION_COOKIE}=true; Path=/; Max-Age=86400; SameSite=Lax`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;

  document.cookie = `${PATIENT_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
