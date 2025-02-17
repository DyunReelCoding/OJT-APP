"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComboBox from "@/components/ComboBox"; // Import the ComboBox component
import StudentListPrintButton from "./StudentListButton";
import { FaEnvelope } from "react-icons/fa"; // Import the email icon
import EmailForm from "@/components/EmailForm"; // Import EmailForm component

const StudentList = ({ students }: { students: any[] }) => {
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState(""); // Selected filter type
  const [currentPage, setCurrentPage] = useState(0);
  const [emails, setEmails] = useState<string[]>([]); // To store filtered student emails
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [view, setView] = useState("student"); // View toggle state (student or employee)
  const studentsPerPage = 5;
  const router = useRouter();

  // Filter students based on search query and selected filter type
  useEffect(() => {
    let filtered = students;

    if (view === "student") {
      filtered = students.filter(student => student.occupation === "Student");
    } else if (view === "employee") {
      filtered = students.filter(student => student.occupation === "employee");
    }

    if (filterType) {
      filtered = filtered.filter((student) =>
        student[filterType]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(query) ||
          student.idNumber?.toLowerCase().includes(query) ||
          student.program?.toLowerCase().includes(query) ||
          student.office?.toLowerCase().includes(query) ||
          student.yearLevel?.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
    setCurrentPage(0); // Reset pagination when filtering

    // Collect emails of filtered students
    const studentEmails = filtered.map((student) => student.email);
    setEmails(studentEmails);
  }, [searchQuery, filterType, students, view]);

  // Paginate students
  const startIndex = currentPage * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  // Handle student click with loading state
  const handleStudentClick = (studentId: string) => {
    setLoadingId(studentId); // Set loading state
    router.push(`/patients/${studentId}/studentDetail`);
  };

  return (
    <section className="student-list w-full px-6">
      <h2 className="text-2xl font-semibold mb-4 text-white text-center">
        {view === "student" ? "Student List" : "Employee List"}
      </h2>

      {/* View Toggle */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setView("student")}
          className={`px-4 py-2 mx-2 ${view === "student" ? "bg-blue-500" : "bg-gray-700"} text-white rounded-lg`}
        >
          Student View
        </button>
        <button
          onClick={() => setView("employee")}
          className={`px-4 py-2 mx-2 ${view === "employee" ? "bg-blue-500" : "bg-gray-700"} text-white rounded-lg`}
        >
          Employee View
        </button>
      </div>

      {/* Centered Search & ComboBox */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex justify-end mb-4">
        <StudentListPrintButton
        filteredStudents={filteredStudents}
        filterType={filterType}
        view={view} // Pass the 'view' prop to the StudentListPrintButton
      />
        </div>
        <div className="w-96">
          <ComboBox filterType={filterType} setFilterType={setFilterType} />
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="w-96 p-3 border border-gray-700 rounded-lg bg-gray-900 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <p className="text-gray-400 text-center">No {view}s found.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full bg-gray-800 text-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-700 text-left text-sm uppercase">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">ID Number</th>
                {view === "student" ? (
                  <>
                    <th className="py-3 px-6">Program</th>
                    <th className="py-3 px-6">Year Level</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-6">Office</th>
                
                  </>
                )}
                {filterType && <th className="py-3 px-6">{filterType.replace(/([A-Z])/g, " $1")}</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student: any) => (
                <tr key={student.$id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                  <td className="py-3 px-6">
                    <button
                      onClick={() => handleStudentClick(student.$id)}
                      className="text-blue-400 hover:text-blue-500 transition"
                      disabled={loadingId !== null}
                    >
                      {student.name}
                      {loadingId === student.$id && <span className="ml-2 animate-spin">🔄</span>}
                    </button>
                  </td>
                  <td className="py-3 px-6">{student.idNumber}</td>
                  {view === "student" ? (
                    <>
                      <td className="py-3 px-6">{student.program}</td>
                      <td className="py-3 px-6">{student.yearLevel}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-6">{student.office}</td>
                     
                    </>
                  )}
                  {filterType && <td className="py-3 px-6">{student[filterType] || "N/A"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Email Button */}
      {emails.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)} // Open the modal on button click
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md flex items-center gap-2"
          >
            <FaEnvelope /> Send Email to All
          </button>
        </div>
      )}

      {/* Modal for sending email */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full">
            <EmailForm studentEmail={emails.join(",")} />
            <button
              onClick={() => setIsModalOpen(false)} // Close the modal
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 mx-2 bg-gray-700 text-white rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          ← Prev
        </button>
        <button
          className="px-4 py-2 mx-2 bg-gray-700 text-white rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => (startIndex + studentsPerPage < filteredStudents.length ? prev + 1 : prev))}
          disabled={startIndex + studentsPerPage >= filteredStudents.length}
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default StudentList;
