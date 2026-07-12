"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface IdleLogoutProps {
  timeoutMinutes?: number;
}

const IdleLogout = ({ timeoutMinutes = 3 }: IdleLogoutProps) => {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let redirectTimeoutId: ReturnType<typeof setTimeout>;

    const logout = () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("patientSession");
        localStorage.removeItem("employeeSession");
      }

      setMessage("You have been logged out due to inactivity. Redirecting to home...");
      redirectTimeoutId = setTimeout(() => router.replace("/"), 1000);
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      clearTimeout(redirectTimeoutId);
      setMessage("");
      timeoutId = setTimeout(logout, timeoutMinutes * 60 * 1000);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(redirectTimeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router, timeoutMinutes]);

  return message ? (
    <div className="fixed top-4 left-1/2 z-50 w-[min(90vw,520px)] -translate-x-1/2 rounded-lg bg-amber-100 px-4 py-3 text-center text-sm text-amber-900 shadow-lg ring-1 ring-amber-200">
      {message}
    </div>
  ) : null;
};

export default IdleLogout;
