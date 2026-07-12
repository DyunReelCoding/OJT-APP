import { useState } from "react";
import { Menu, X, User, Home, FileText, Calendar, ClipboardList, FileCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiArrowLeft } from 'react-icons/fi'; // Import the back arrow icon

const StudentSideBar = ({ userId }: { userId: string }) => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname(); 

  const navLinks = [
    {
      label: "Dashboard",
      href: `/patients/${userId}/student`,
      icon: <Home className="w-5 h-5" />
    },
    {
      label: "My Details",
      href: `/patients/${userId}/studentDetail`,
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: "My Calendar",
      href: `/patients/${userId}/student/calendar`,
      icon: <Calendar className="w-5 h-5" />
    },
    {
      label: "My Appointments",
      href: `/patients/${userId}/student/myAppointments`,
      icon: <ClipboardList className="w-5 h-5" />
    },
    {
      label: "Go Back Home",
      href: `/`,
      icon: <FiArrowLeft className="w-5 h-5" /> // Use the back arrow icon here
    }
  ];

  return (
    <div className={`${isOpen ? "w-64" : "w-16"} bg-white text-blue-700 min-h-screen overflow-hidden transition-all duration-300 ease-in-out`}>
      <div className="flex justify-between items-center p-4">
        {isOpen && <h2 className="text-xl font-bold transition-opacity duration-300 ease-in-out">Student Portal</h2>}
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <nav className="mt-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            replace={link.href === "/"}
            className={`flex items-center gap-2 p-4 hover:bg-blue-100 transition-colors ${
              pathname === link.href ? "bg-blue-100" : ""
            }`}
          >
            {link.icon}
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
              isOpen ? "max-w-full opacity-100" : "max-w-0 opacity-0"
            }`}>
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default StudentSideBar; 