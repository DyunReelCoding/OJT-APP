'use client';

import React, { useEffect, useState, useRef } from "react";
import { Client, Databases } from "appwrite";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Appointment {
  $id: string;
  patientName: string;
  college: string;
  occupation: string;
  diagnosis: string;
}

const DentalServicesAnnualReport = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const complaintsPerPage = 9;

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_COLLEGE_COLLECTION_ID!
      );
      setColleges(response.documents.map((doc: any) => doc.name));
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c" // Your appointments collection ID
      );
      setAppointments(response.documents as Appointment[]);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const getDentalComplaintCounts = (college: string | null, occupation: string | null) => {
    const complaintCounts: Record<string, number> = {};

    const filteredAppointments = appointments.filter((appointment) => {
      const collegeMatches = college === null
        ? true
        : ((appointment.college || '').trim().toLowerCase() === college.trim().toLowerCase());

      const occupationMatches = occupation === null ? true : appointment.occupation === occupation;
      return collegeMatches && occupationMatches;
    });

    filteredAppointments.forEach((appointment) => {
      let dentalComplaints: string[] = [];
      try {
        const parsed = JSON.parse(appointment.diagnosis);
        dentalComplaints = Array.isArray(parsed?.dental) ? parsed.dental : [];
      } catch {
        dentalComplaints = [];
      }

      dentalComplaints
        .filter((complaint) => complaint.trim() !== "")
        .forEach((complaint) => {
          complaintCounts[complaint] = (complaintCounts[complaint] || 0) + 1;
        });
    });

    return complaintCounts;
  };

  const allDentalComplaints = Array.from(
    new Set(
      appointments.flatMap((appointment) => {
        try {
          const parsed = JSON.parse(appointment.diagnosis);
          return parsed?.dental || [];
        } catch {
          return [];
        }
      })
    )
  ).filter((complaint) => complaint.trim() !== "").sort();

  const totalPages = Math.ceil(allDentalComplaints.length / complaintsPerPage);

  const paginatedComplaints = allDentalComplaints.slice(
    currentPage * complaintsPerPage,
    (currentPage + 1) * complaintsPerPage
  );

  const renderCollegeComplaintRow = (college: string | null, occupation: string | null, label: string) => {
    const complaintCounts = getDentalComplaintCounts(college, occupation);
    const totalComplaints = paginatedComplaints.reduce(
      (sum, complaint) => sum + (complaintCounts[complaint] || 0),
      0
    );

    return (
      <tr key={label}>
        <td className="border px-4 py-2 font-bold text-left">{label}</td>
        {paginatedComplaints.map((complaint) => (
          <td key={complaint} className="border px-4 py-2 text-center">
            {complaintCounts[complaint] || 0}
          </td>
        ))}
        <td className="border px-4 py-2 font-bold text-center">{totalComplaints}</td>
      </tr>
    );
  };

  const calculatePageSubtotal = () => {
    const subtotal: Record<string, number> = {};

    paginatedComplaints.forEach((complaint) => {
      subtotal[complaint] = 0;
      colleges.forEach((college) => {
        const counts = getDentalComplaintCounts(college, "Student");
        subtotal[complaint] += counts[complaint] || 0;
      });

      const facultyCounts = getDentalComplaintCounts(null, "Employee");
      subtotal[complaint] += facultyCounts[complaint] || 0;
    });

    return subtotal;
  };

  const renderPageTotalRow = () => {
    const pageTotals = calculatePageSubtotal();
    const totalSum = Object.values(pageTotals).reduce((sum, count) => sum + count, 0);

    return (
      <tr className="bg-gray-100 font-semibold">
        <td className="border px-4 py-2 text-left">TOTAL</td>
        {paginatedComplaints.map((complaint) => (
          <td key={complaint} className="border px-4 py-2 text-center">
            {pageTotals[complaint] || 0}
          </td>
        ))}
        <td className="border px-4 py-2 text-center">{totalSum}</td>
      </tr>
    );
  };

  const generateChartData = () => {
    const facultyCounts = getDentalComplaintCounts(null, "Employee");

    return paginatedComplaints.map((complaint) => {
      const data: Record<string, string | number> = { name: complaint };

      colleges.forEach((college) => {
        const counts = getDentalComplaintCounts(college, "Student");
        data[college] = counts[complaint] || 0;
      });

      data["Faculty & Staff"] = facultyCounts[complaint] || 0;

      return data;
    });
  };

  const generatePDFReport = async () => {
    if (reportRef.current && chartRef.current) {
      try {
        const reportCanvas = await html2canvas(reportRef.current);
        const chartCanvas = await html2canvas(chartRef.current);

        const pdf = new jsPDF("l", "mm", [215.9, 330.2]);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = 200;
        const imgWidthChart = 180;
        const imgHeight = (reportCanvas.height * imgWidth) / reportCanvas.width;
        const chartHeight = (chartCanvas.height * imgWidthChart) / chartCanvas.width;
        const x = (pageWidth - imgWidth) / 2;

        const reportImage = reportCanvas.toDataURL("image/png");
        const chartImage = chartCanvas.toDataURL("image/png");

        const headerImagePath = "/assets/images/University_Annual.png";
        const headerImage = new Image();
        headerImage.src = headerImagePath;

        headerImage.onload = () => {
          pdf.addImage(headerImage, "PNG", 71, 5, 199, 31);
          pdf.setFont("Helvetica", "Bold");
          pdf.setFontSize(11);
          pdf.text("Dental Services Annual Report", 140, 45);
          pdf.text(`January - December ${new Date().getFullYear()}`, 146, 50);

          pdf.addImage(reportImage, "PNG", x, 55, imgWidth, imgHeight);
          const newY = 60 + imgHeight;
          pdf.addImage(chartImage, "PNG", x, newY, imgWidth, chartHeight);

          pdf.save("Dental_Services_Annual_Report.pdf");
        };

        headerImage.onerror = (err) => {
          console.error("Error loading header image:", err);
          alert("Failed to load header image.");
        };
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF report.");
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dental Services Annual Report</h1>
        <button
          onClick={generatePDFReport}
          className="flex justify-end items-end mt-4 bg-blue-700 hover:bg-white hover:text-blue-700 border-2 border-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Download Report as PDF
        </button>
      </div>

      <div className="flex justify-between items-center mt-3 mb-2 text-white">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          className="bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-black">Page {currentPage + 1} of {totalPages}</span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
          className="bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div ref={reportRef} className="mb-4 overflow-x-auto">
        <table className="table-auto w-full border-collapse border">
          <thead>
            <tr className="bg-white">
              <th colSpan={paginatedComplaints.length + 2} className="border px-4 py-2 text-center">
                Dental Complaints
              </th>
            </tr>
            <tr className="bg-blue-100">
              <th className="border px-4 py-2">College/Category</th>
              {paginatedComplaints.map((complaint) => (
                <th key={complaint} className="border px-4 py-2">{complaint}</th>
              ))}
              <th className="border px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college) =>
              renderCollegeComplaintRow(college, "Student", `${college} Students`)
            )}
            {renderCollegeComplaintRow(null, "Employee", "Faculty and Staff")}
            {renderPageTotalRow()}
          </tbody>
        </table>
      </div>

      <div ref={chartRef} className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={generateChartData()}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {colleges.map((college) => (
              <Bar key={college} dataKey={college} fill="#8884d8" />
            ))}
            <Bar key="Faculty & Staff" dataKey="Faculty & Staff" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DentalServicesAnnualReport;
