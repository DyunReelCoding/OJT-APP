import type { Metadata } from "next";
import IdleLogout from "@/components/IdleLogout";
import UrlMask from "@/components/UrlMask";

export const metadata: Metadata = {
  title: "Patient Portal",
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleLogout timeoutMinutes={3} />
      <UrlMask />
      {children}
    </>
  );
}