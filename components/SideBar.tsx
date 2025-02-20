"use client";

import { useState } from "react";
import { Menu, X, ShieldAlert, Home, Briefcase, Users, Calendar, Pill, Stethoscope } from "lucide-react"; // Import Briefcase icon
import BackToHomeButton from "./BackToHomeButton"; // Import Back Button
import Link from "next/link"; // Import Link for navigation
import { usePathname } from "next/navigation";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const navLinks = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <Users className="w-5 h-5" />
    },
    {
      label: "Calendar",
      href: "/admin/calendar",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      label: "Appointments",
      href: "/admin/appointments",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      label: "Medicines",
      href: "/admin/medicines",
      icon: <Stethoscope className="w-5 h-5" />
    },
    {
      label: "Allergies",
      href: "/admin/allergies",
      icon: <Pill className="w-5 h-5" />
    },
    {
      label: "Occupation",
      href: "/admin/occupation",
      icon: <Briefcase className="w-5 h-5" />
    }
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } bg-gray-100 shadow-lg border-r border-gray-700 flex flex-col`}
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
  );
};

export default SideBar;
