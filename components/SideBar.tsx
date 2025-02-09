"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react"; // Import icons
import BackToHomeButton from "./BackToHomeButton"; // Import Back Button

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

      {/* Back to Home Button (inside Sidebar) */}
      {isOpen && (
        <div className="p-4 mt-auto">
          <BackToHomeButton />
        </div>
      )}
    </div>
  );
};

export default SideBar;
