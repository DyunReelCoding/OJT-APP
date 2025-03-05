"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Briefcase, Users, Calendar, Pill, Stethoscope, ClipboardList } from "lucide-react";
import BackToHomeButton from "./BackToHomeButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement | null>(null); // Create a reference for the sidebar

  const navLinks = [
    { label: "Dashboard", href: "/admin", icon: <Users className="w-5 h-5" /> },
    { label: "Calendar", href: "/admin/calendar", icon: <Calendar className="w-5 h-5" /> },
    { label: "Manage Appointments", href: "/admin/appointments", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Manage Medicines", href: "/admin/medicines", icon: <Stethoscope className="w-5 h-5" /> },
    { label: "Allergies and Current Medications", href: "/admin/allergies", icon: <Pill className="w-5 h-5" /> },
    { label: "Occupation and Office Types", href: "/admin/occupation", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Program Types", href: "/admin/program", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Past/Family Medical History", href: "/admin/MedicalHistory", icon: <Briefcase className="w-5 h-5" /> }
  ];

  // Handle click outside sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false); // Close sidebar if clicked outside
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Sidebar Container */}
      <div
        ref={sidebarRef} // Attach ref to sidebar
        className={`fixed left-0 top-0 h-screen transition-all duration-300 ${
          isOpen ? "w-96" : "w-16"
        } bg-white shadow-lg border-r border-gray-700 flex flex-col z-10`}
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="m-4 flex items-center gap-2 text-blue-700"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar Links */}
        {isOpen && (
          <nav className="p-4">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-2 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded ${
                      pathname === link.href ? "bg-blue-100" : ""
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Back to Home Button */}
        {isOpen && (
          <div className="p-4 mt-auto">
            <BackToHomeButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
