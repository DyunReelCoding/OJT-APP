"use client";

import { useState } from "react";
import { Menu, X, ShieldAlert, Home, Briefcase } from "lucide-react"; // Import Briefcase icon
import BackToHomeButton from "./BackToHomeButton"; // Import Back Button
import Link from "next/link"; // Import Link for navigation

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`fixed left-0 top-0 h-full transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } bg-gray-800 shadow-lg border-r border-gray-700 flex flex-col`}
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="m-4 flex items-center gap-2 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Links */}
      {isOpen && (
        <nav className="p-4">
          <ul className="space-y-4">
            {/* Home Button */}
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-2 text-white hover:bg-gray-700 px-4 py-2 rounded"
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
            </li>

            {/* Allergies Button */}
            <li>
              <Link
                href="/admin/allergies"
                className="flex items-center gap-2 text-white hover:bg-gray-700 px-4 py-2 rounded"
              >
                <ShieldAlert size={20} />
                <span>Allergies and Medication</span>
              </Link>
            </li>

            {/* Occupations Button */}
            <li>
              <Link
                href="/admin/occupation"
                className="flex items-center gap-2 text-white hover:bg-gray-700 px-4 py-2 rounded"
              >
                <Briefcase size={20} />
                <span>Occupations and Office Types</span>
              </Link>
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
  );
};

export default SideBar;
