"use client";

import { useRef } from "react";
import { Printer, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Import autoTable

type StudentListPrintButtonProps = {
  filteredStudents: any[];
  filterType: string;
};

const StudentListPrintButton = ({ filteredStudents, filterType }: StudentListPrintButtonProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Student List", 105, 15, { align: "center" });

    if (filterType) {
      doc.setFontSize(12);
      doc.text(`Filter: ${filterType.replace(/([A-Z])/g, " $1")}`, 105, 25, { align: "center" });
    }

    // Table Data
    const tableColumn = ["Name", "ID Number", "Program", "Year Level"];
    if (filterType) {
      tableColumn.push(filterType.replace(/([A-Z])/g, " $1"));
    }

    const tableRows = filteredStudents.map((student) => {
      const row = [student.name, student.idNumber, student.program, student.yearLevel];
      if (filterType) {
        row.push(student[filterType] || "N/A");
      }
      return row;
    });

    // ✅ Use autoTable correctly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [200, 200, 200] },
    });

    // Save PDF
    const fileName = `Student_List${filterType ? `_${filterType}` : ""}.pdf`;
    doc.save(fileName);
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Printer size={20} className="mr-2" /> Print List
        </button>

        {/* PDF Download Button */}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <FileText size={20} className="mr-2" /> Download PDF
        </button>
      </div>

      {/* Hidden print section */}
      <div ref={printRef} className="hidden print:block">
        <h2 className="text-center text-xl font-semibold mb-4">Student List</h2>

        {/* Display selected filter type */}
        {filterType && (
          <p className="text-center font-semibold mb-2">
            Filter: {filterType.replace(/([A-Z])/g, " $1")}
          </p>
        )}

        <table className="w-full border border-gray-500">
          <thead>
            <tr className="bg-gray-300">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">ID Number</th>
              <th className="py-2 px-4 border">Program</th>
              <th className="py-2 px-4 border">Year Level</th>
              {filterType && <th className="py-2 px-4 border">{filterType.replace(/([A-Z])/g, " $1")}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.$id}>
                <td className="py-2 px-4 border">{student.name}</td>
                <td className="py-2 px-4 border">{student.idNumber}</td>
                <td className="py-2 px-4 border">{student.program}</td>
                <td className="py-2 px-4 border">{student.yearLevel}</td>
                {filterType && <td className="py-2 px-4 border">{student[filterType] || "N/A"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StudentListPrintButton;
