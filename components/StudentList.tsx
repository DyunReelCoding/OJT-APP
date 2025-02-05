"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const StudentList = ({ students }: { students: any[] }) => {
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  // Filter students based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name?.toLowerCase().includes(query) ||
        student.idNumber?.toLowerCase().includes(query) ||
        student.program?.toLowerCase().includes(query) ||
        student.yearLevel?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  // Handle student click with loading state
  const handleStudentClick = (studentId: string) => {
    setLoadingId(studentId); // Set loading state
    router.push(`/patients/${studentId}/studentDetail`);
  };

  return (
    <section className="student-list">
      <h2 className="text-2xl font-semibold mb-4 text-white">Student List</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search students..."
        className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredStudents.length === 0 ? (
        <p className="text-gray-400">No students found.</p>
      ) : (
        <div className="flex flex-col space-y-4">
          {filteredStudents.map((student: any, index: number) => (
            <div
              key={student.$id}
              className={`p-4 rounded-lg shadow-md ${
                index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
              }`}
            >
              {/* Clickable Student Name with Loading Indicator */}
              <button
                onClick={() => handleStudentClick(student.$id)}
                className="text-lg font-semibold text-blue-400 hover:text-blue-500 transition flex items-center"
                disabled={loadingId !== null} // Disable clicks while loading
              >
                {student.name}
                {loadingId === student.$id && (
                  <span className="ml-2 animate-spin">🔄</span> // Show loading spinner
                )}
              </button>

              <p className="text-gray-400">ID Number: {student.idNumber}</p>
              <p className="text-gray-400">Program: {student.program}</p>
              <p className="text-gray-400">Year Level: {student.yearLevel}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default StudentList;
