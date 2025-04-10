"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComboBox from "@/components/ComboBox";
import StudentListPrintButton from "./StudentListButton";
import { FaEnvelope } from "react-icons/fa";
import EmailForm from "@/components/EmailForm";
import { FaTrash } from "react-icons/fa";

const StudentList = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [emails, setEmails] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("student");
  const [bmiCategory, setBmiCategory] = useState("");
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dietRecommendation, setDietRecommendation] = useState("");
  const studentsPerPage = 5;
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const deleteLabel = view === "student" ? "Student Deleted" : "Employee Deleted";

  
  const confirmMessage = view === "student"
  ? "Are you sure you want to delete this student?"
  : "Are you sure you want to delete this employee?";

  const confirmDelete = (id: string) => {
    setStudentToDelete(id);
    setShowConfirmModal(true);
  };
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000); // Disappear after 3 seconds
  
      return () => clearTimeout(timer); // Cleanup if message changes or component unmounts
    }
  }, [message]);
  


  // Fetch students when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students/");
        if (!res.ok) throw new Error("Failed to fetch students");

        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, []);

  // Filter students whenever dependencies change
  useEffect(() => {
    const normalizeOccupation = (occupation: string) => occupation.toLowerCase().replace(/s$/, "");

    let filtered = students;

    if (view === "student") {
      filtered = filtered.filter((student) => normalizeOccupation(student.occupation) === "student");
    } else if (view === "employee") {
      filtered = filtered.filter((student) => normalizeOccupation(student.occupation) === "employee");
    }

    if (filterType === "bmiCategory" && bmiCategory) {
      filtered = filtered.filter((student) => student.bmiCategory === bmiCategory);
    } else if (filterType) {
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
    setEmails(filtered.map((student) => student.email));
    setCurrentPage(0);
  }, [students, searchQuery, filterType, view, bmiCategory]);

  const startIndex = currentPage * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  const handleStudentClick = (studentId: string) => {
    setLoadingId(studentId);
    router.push(`/patients/${studentId}/studentDetailAdmin`);
  };

  // Function to send diet recommendation to a single student
  const sendDietRecommendation = async () => {
    if (!selectedStudentId || !dietRecommendation) return;

    try {
      const res = await fetch(`/api/students/${selectedStudentId}/recommendation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dietRecommendation }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to send recommendation");
      }

      alert("Diet recommendation sent successfully!");
      setIsRecommendationModalOpen(false);
      setDietRecommendation("");
    } catch (err) {
      console.error("Error sending recommendation:", err);
      alert("Failed to send recommendation");
    }
  };

  // Function to send diet recommendation to all students in the current filtered list
  const sendBulkRecommendation = async () => {
    if (!dietRecommendation) return;
  
    try {
      const res = await fetch(`/api/students/bulk-recommendation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: filteredStudents.map((student) => student.$id),
          dietRecommendation,
        }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to send bulk recommendation");
      }
  
      const data = await res.json();
      console.log("Bulk recommendation response:", data);
  
      alert("Bulk recommendation sent successfully!");
      setIsRecommendationModalOpen(false);
      setDietRecommendation("");
    } catch (err) {
      console.error("Error sending bulk recommendation:", err);
      alert("Failed to send bulk recommendation");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData?.type === "document_not_found") {
          setMessage({ type: "error", text: "Student not found. It may have already been deleted." });
        } else {
          setMessage({ type: "error", text: "Failed to delete student." });
        }
        return;
      }
  
      // Remove the student from the list locally
      setStudents((prev) => prev.filter((student) => student.$id !== id));
      setMessage({ type: "success", text: "Patient deleted successfully." });
  
    } catch (error) {
      console.error("Error deleting student:", error);
      setMessage({ type: "error", text: "An unexpected error occurred while deleting." });
    }
  };
  
  
  
  

  return (
    <section className="student-list w-full px-6">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-center">
        {view === "student" ? "Student List" : "Employee List"}
      </h2>

      {/* View Toggle */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setView("student")}
          className={`px-4 py-2 mx-2 rounded-lg ${view === "student" ? "bg-blue-700 text-white" : "bg-gray-200 text-black"}`}
        >
          Student View
        </button>
        <button
          onClick={() => setView("employee")}
          className={`px-4 py-2 mx-2 rounded-lg ${view === "employee" ? "bg-blue-700 text-white" : "bg-gray-200 text-black"}`}
        >
          Employee View
        </button>
      </div>
      {message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col items-center mb-4">
        <StudentListPrintButton filteredStudents={filteredStudents} filterType={filterType} view={view} />
        <div className="w-96 mt-2">
          <ComboBox filterType={filterType} setFilterType={setFilterType} />
        </div>
        {filterType === "bmiCategory" && (
          <select
            className="w-96 p-3 border-2 border-blue-700 rounded-xl bg-white text-black shadow-sm mt-2 focus:outline-none"
            value={bmiCategory}
            onChange={(e) => setBmiCategory(e.target.value)}
          >
            <option value="">Select BMI Category</option>
            <option value="Underweight">Underweight</option>
            <option value="Normal">Normal</option>
            <option value="Overweight">Overweight</option>
            <option value="Obese">Obese</option>
          </select>
        )}
        <input
          type="text"
          placeholder="Search..."
          className="w-96 p-3 border-2 border-blue-700 rounded-xl bg-white text-black shadow-sm mt-2 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      {filteredStudents.length === 0 ? (
        <p className="text-gray-400 text-center">No {view}s found.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border-2 border-blue-700">
          <table className="w-full text-white shadow-lg">
            <thead>
              <tr className="bg-blue-700 text-left text-sm uppercase">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">ID Number</th>
                {view === "student" ? (
                  <>
                    <th className="py-3 px-6">Program</th>
                    <th className="py-3 px-6">Year Level</th>
                    <th className="py-3 px-6"></th>
                  </>
                ) : (
                  <><th className="py-3 px-6">Office</th><th className="py-3 px-6"></th></>
                  
                )}
                {filterType && <th className="py-3 px-6">{filterType.replace(/([A-Z])/g, " $1")}</th>}
                {(filterType === "allergies" || filterType === "bmiCategory") && (
                  <th className="py-3 px-6">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => (
                <tr key={student.$id} className="bg-white text-black hover:bg-blue-400 hover:text-white transition">
                  <td className="py-3 px-6">
                    <button onClick={() => handleStudentClick(student.$id)} className="text-blue-700 hover:text-white">
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
  <td className="py-3 px-6">{student.office}</td>
)}
<td className="py-3 px-6 text-right ">
  <button onClick={() => confirmDelete(student.$id)} className="text-red-600 hover:text-red-800"
    title="Delete Student"
  >
    <FaTrash />
  </button>
</td>

                  {filterType && <td className="py-3 px-6">{student[filterType] ?? "N/A"}</td>}
                  {(filterType === "allergies" || filterType === "bmiCategory") && (
                    <td className="py-3 px-6">
                      <button
                        onClick={() => {
                          setSelectedStudentId(student.$id);
                          setIsRecommendationModalOpen(true);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Send Recommendation
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
     {showConfirmModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-md text-black w-80">
      <h3 className="text-xl font-semibold mb-4 text-center text-red-600">{deleteLabel}</h3>
      <p className="mb-6 text-center">{confirmMessage}</p>
      <div className="flex justify-center gap-4">
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
          onClick={() => setShowConfirmModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          onClick={() => {
            if (studentToDelete) handleDelete(studentToDelete);
            setShowConfirmModal(false);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}





      {/* Recommendation Modal */}
      {isRecommendationModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Send Diet Recommendation</h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              placeholder="Enter diet recommendation..."
              value={dietRecommendation}
              onChange={(e) => setDietRecommendation(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRecommendationModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={filteredStudents.length > 1 ? sendBulkRecommendation : sendDietRecommendation}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
              >
                {filteredStudents.length > 1 ? "Send to All" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emails.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2">
            <FaEnvelope /> Send Email to All
          </button>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full">
            <EmailForm studentEmail={emails.join(",")} />
            <button onClick={() => setIsModalOpen(false)} className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          className="px-4 py-2 mx-2 bg-gray-700 text-white rounded disabled:opacity-50"
          disabled={currentPage === 0}
        >
          ← Prev
        </button>
        <button
          onClick={() => setCurrentPage((prev) => (startIndex + studentsPerPage < filteredStudents.length ? prev + 1 : prev))}
          className="px-4 py-2 mx-2 bg-green-400 text-white rounded disabled:opacity-50"
          disabled={startIndex + studentsPerPage >= filteredStudents.length}
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default StudentList;