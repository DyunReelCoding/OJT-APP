"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Printer, FileText } from "lucide-react";

const PrintButton = ({ student }: { student: any }) => {
  const generatePDF = (printMode = false) => {
    const doc = new jsPDF("p", "mm", "a4");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${student.name}'s Medical Record`, 105, 15, { align: "center" });

    let y = 25;

    // Personal Information Table
    autoTable(doc, {
      startY: y,
      head: [["Personal Information", "Details"]],
      body: [
        ["Phone", student.phone || "N/A"],
        ["Gender", student.gender || "N/A"],
        ["Birth Date", student.birthDate || "N/A"],
        ["Age", student.age || "N/A"],
        ["Address", student.address || "N/A"],
        ["Occupation", student.occupation || "N/A"],
      ],
      theme: "grid",
      styles: { fontSize: 12 },
      headStyles: { fillColor: [200, 200, 200] },
    });
    // @ts-ignore
    y = doc.lastAutoTable.finalY + 10;

    // Medical Information Table
    autoTable(doc, {
      startY: y,
      head: [["Medical Information", "Details"]],
      body: [
        ["Blood Type", student.bloodType || "N/A"],
        ["Allergies", student.allergies || "N/A"],
        ["Current Medication", student.currentMedication || "N/A"],
        ["Family Medical History", student.familyMedicalHistory || "N/A"],
        ["Past Medical History", student.pastMedicalHistory || "N/A"],
        ["Primary Physician", student.primaryPhysician || "N/A"],
      ],
      theme: "grid",
      styles: { fontSize: 12 },
      headStyles: { fillColor: [200, 200, 200] },
    });
// @ts-ignore
    y = doc.lastAutoTable.finalY + 10;

    // Identification Table
    autoTable(doc, {
      startY: y,
      head: [["Identification", "Details"]],
      body: [
        ["ID Type", student.identificationType || "N/A"],
        ["ID Number", student.identificationNumber || "N/A"],
      ],
      theme: "grid",
      styles: { fontSize: 12 },
      headStyles: { fillColor: [200, 200, 200] },
    });
// @ts-ignore
    y = doc.lastAutoTable.finalY + 10;
    doc.text("Generated on: " + new Date().toLocaleString(), 14, y);

    if (printMode) {
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } else {
      doc.save(`${student.name}_Medical_Record.pdf`);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Download PDF Button */}
      <button
        onClick={() => generatePDF(false)}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
      >
        <FileText className="mr-2" /> Download PDF
      </button>
      
      {/* Print Button */}
      <button
        onClick={() => generatePDF(true)}
        className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md"
      >
        <Printer className="mr-2" /> Print
      </button>
    </div>
  );
};

export default PrintButton;
