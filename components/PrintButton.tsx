"use client";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Printer } from "lucide-react";

const PrintButton = ({ student }: { student: any }) => {
  const generatePDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Convert student data into a custom PDF layout
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${student.name}'s Medical Record`, 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    let y = 30;

    const addText = (label: string, value: string) => {
      doc.text(`${label}: ${value || "N/A"}`, 14, y);
      y += 8;
    };

    // Personal Information
    doc.setFont("helvetica", "bold");
    doc.text("Personal Information", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    addText("Email", student.email);
    addText("Phone", student.phone);
    addText("Gender", student.gender);
    addText("Birth Date", student.birthDate);
    addText("Age", student.age);
    addText("Address", student.address);
    addText("Occupation", student.occupation);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Medical Information", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    addText("Blood Type", student.bloodType);
    addText("Allergies", student.allergies);
    addText("Current Medication", student.currentMedication);
    addText("Family Medical History", student.familyMedicalHistory);
    addText("Past Medical History", student.pastMedicalHistory);
    addText("Primary Physician", student.primaryPhysician);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Identification", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    addText("ID Type", student.identificationType);
    addText("ID Number", student.identificationNumber);

    y += 10;
    doc.text("Generated on: " + new Date().toLocaleString(), 14, y);

    // Save the PDF
    doc.save(`${student.name}_Medical_Record.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
    >
      <Printer className="mr-2" />
      Print PDF
    </button>
  );
};

export default PrintButton;
