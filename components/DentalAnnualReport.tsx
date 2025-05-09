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
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedGender, setSelectedGender] = useState<string>("");

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
        // First fetch appointments
        const appointmentsResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          "67b96b0800349392bb1c"
        );
        
        // Then fetch patient data to get genders
        const patientsResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!
        );
    
        // Create a map of patient names to genders (assuming patientName is the common field)
        const patientGenderMap: Record<string, string> = {};
        patientsResponse.documents.forEach((patient: any) => {
          patientGenderMap[patient.name] = patient.gender;
        });
    

        const appointmentsWithGender = appointmentsResponse.documents.map((appointment: any) => ({
          ...appointment,
          gender: patientGenderMap[appointment.patientName] || 'unknown'
        }));
    
        setAppointments(appointmentsWithGender as Appointment[]);
        setFilteredAppointments(appointmentsWithGender as Appointment[]);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    
    // Update the filter effect to properly handle gender filtering
    useEffect(() => {
      if (selectedGender) {
        const filtered = appointments.filter(appointment => 
          appointment.gender?.toLowerCase() === selectedGender.toLowerCase()
        );
        setFilteredAppointments(filtered);
      } else {
        setFilteredAppointments(appointments);
      }
    }, [selectedGender, appointments]);

    const getDentalComplaintCounts = (college: string | null, occupation: string | null) => {
      const complaintCounts: Record<string, number> = {};
    
      filteredAppointments.forEach((appointment) => {
        const diagnosis = JSON.parse(appointment.diagnosis) || {};
        const dental = Array.isArray(diagnosis.dental)
          ? diagnosis.dental
          : diagnosis.dental ? [diagnosis.dental] : [];
    
        if (
          (college === null || appointment.college === college) &&
          (occupation === null || appointment.occupation === occupation)
        ) {
          dental
            .filter((diagnosis: string) => diagnosis && diagnosis.trim() !== "")
            .forEach((diagnosis: string) => {
              complaintCounts[diagnosis] = (complaintCounts[diagnosis] || 0) + 1;
            });
        }
      });
    
      return complaintCounts;
    };
    
    const allDentalComplaints = Array.from(
      new Set(
        filteredAppointments.flatMap((appointment) => {
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

      const handleGenderFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGender(e.target.value);
        setCurrentPage(0); // Reset to first page when filter changes
      };
  
      const clearGenderFilter = () => {
        setSelectedGender("");
        setCurrentPage(0);
      };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dental Services Annual Report</h1>
        <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <select
                value={selectedGender}
                onChange={handleGenderFilter}
                className="border rounded px-3 py-2 bg-white text-blue-700"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {selectedGender && (
                <button
                  onClick={clearGenderFilter}
                  className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <button
              onClick={generatePDFReport}
              className="flex justify-end items-end mt-4 bg-blue-700 hover:bg-white hover:text-blue-700 border-2 border-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Download Report as PDF
            </button>
          </div>
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
