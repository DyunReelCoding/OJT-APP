"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const hasAdminCookie = typeof document !== "undefined"
      && document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith("admin_session=true"));

    if (!hasAdminCookie) {
      router.replace("/");
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
  }, [pathname, router]);

  useEffect(() => {
    // This is deliberately presentation-only: it changes the address bar after
    // an admin route has rendered, but does not weaken the /admin middleware.
    // A refresh at / will still load the public landing page.
    if (authorized && pathname?.startsWith("/admin") && window.location.pathname !== "/") {
      window.history.replaceState(window.history.state, "", "/");
    }
  }, [authorized, pathname]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
