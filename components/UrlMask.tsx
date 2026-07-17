"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function UrlMask({ maskTo = "/" }: { maskTo?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    // Presentation-only: hides the real path in the address bar.
    // Does NOT change routing/auth — middleware still guards the real path.
    if (
      typeof window !== "undefined" &&
      pathname?.startsWith("/patients") &&
      window.location.pathname !== maskTo
    ) {
      window.history.replaceState(window.history.state, "", maskTo);
    }
  }, [pathname, maskTo]);

  return null;
}