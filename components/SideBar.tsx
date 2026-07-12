"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Briefcase, Users, Calendar, Pill, Stethoscope, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import BackToHomeButton from "./BackToHomeButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [showTypeOptions, setShowTypeOptions] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement | null>(null); // Create a reference for the sidebar

  const navLinks = [
    { label: "Dashboard", href: "/admin", icon: <Users className="w-5 h-5" /> },
    { label: "Calendar", href: "/admin/calendar", icon: <Calendar className="w-5 h-5" /> },
    { label: "Manage Appointments", href: "/admin/appointments", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Manage Medicines", href: "/admin/medicines", icon: <Stethoscope className="w-5 h-5" /> }
  ];

  const typeLinks = [
    { label: "Allergies and Current Medications", href: "/admin/allergies" },
    { label: "College and Office Types", href: "/admin/college" },
    { label: "Program Types", href: "/admin/program" },
    { label: "Past/Family Medical History", href: "/admin/MedicalHistory" }
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

              <li>
                <button
                  type="button"
                  onClick={() => setShowTypeOptions(!showTypeOptions)}
                  className="w-full flex items-center justify-between gap-2 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Type Setup</span>
                  </span>
                  {showTypeOptions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {showTypeOptions && (
                  <ul className="mt-2 space-y-2 rounded-md bg-blue-50 p-2">
                    {typeLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`block rounded px-3 py-2 text-blue-700 hover:bg-blue-100 ${
                            pathname === link.href ? "font-semibold bg-blue-100" : ""
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
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
