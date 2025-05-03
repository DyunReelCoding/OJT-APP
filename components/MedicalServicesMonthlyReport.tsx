import React from 'react';
import { useEffect, useState, useRef } from "react";
import { Client, Query, Databases } from "appwrite";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Appointment {
  $id: string;
  patientName: string;
  college: string;
  occupation: string;
  diagnosis: string;
  date: string; // Assuming this field exists in your documents
}

const MedicalServicesAnnualReport = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [colleges, setColleges] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const complaintsPerPage = 9;
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
    fetchColleges();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const filtered = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getFullYear() === parseInt(year) && 
          (appointmentDate.getMonth() + 1) === parseInt(month)
        );
      });
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [selectedMonth, appointments]);

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
        "67b96b0800349392bb1c"
      );
      setAppointments(response.documents as Appointment[]);
      setFilteredAppointments(response.documents as Appointment[]);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const getChiefComplaintCounts = (college: string | null, occupation: string | null) => {
    const complaintsCount: Record<string, number> = {};

    filteredAppointments.forEach((appointment) => {
      const complaints = JSON.parse(appointment.diagnosis)?.chiefComplaint || [];
      if (
        (college === null || appointment.college === college) &&
        (occupation === null || appointment.occupation === occupation)
      ) {
        complaints
          .filter((complaint: string) => complaint.trim() !== "") // Skip empty complaints
          .forEach((complaint: string) => {
            complaintsCount[complaint] = (complaintsCount[complaint] || 0) + 1;
          });
      }
    });

    return complaintsCount;
  };

  const allComplaints = Array.from(
    new Set(
      filteredAppointments.flatMap((a) => JSON.parse(a.diagnosis)?.chiefComplaint || [])
    )
  ).filter((complaint) => complaint.trim() !== "");

  const totalPages = Math.ceil(allComplaints.length / complaintsPerPage);

  const paginatedComplaints = allComplaints.slice(
    currentPage * complaintsPerPage,
    (currentPage + 1) * complaintsPerPage
  );

  // Extract unique complaints only once
  const uniqueComplaints = Array.from(
    new Set(
      filteredAppointments.flatMap((a) => {
        try {
          const parsed = JSON.parse(a.diagnosis);
          return parsed?.chiefComplaint || [];
        } catch {
          return [];
        }
      })
    )
  ).filter((complaint) => complaint.trim() !== "").sort();

  const renderTableRows = (college: string | null, occupation: string | null, label: string) => {
    const complaints = getChiefComplaintCounts(college, occupation);
    const total = paginatedComplaints.reduce((sum, complaint) => sum + (complaints[complaint] || 0), 0);
  
    return (
      <tr key={label}>
        <td className="border px-4 py-2 font-bold text-left">{label}</td>
        {paginatedComplaints.map((complaint) => (
          <td key={complaint} className="border px-4 py-2 text-center">
            {complaints[complaint] || 0}
          </td>
        ))}
        <td className="border px-4 py-2 font-bold text-center">{total}</td>
      </tr>
    );
  };

  const calculateSubtotal = () => {
    const total: Record<string, number> = {};
  
    const start = currentPage * complaintsPerPage;
    const end = Math.min(start + complaintsPerPage, allComplaints.length);
    const currentPageComplaints = allComplaints.slice(start, end);
  
    currentPageComplaints.forEach((complaint) => {
      total[complaint] = 0;
  
      // Add complaints for each college
      colleges.forEach((college) => { 
        const counts = getChiefComplaintCounts(college, "Student");
        total[complaint] += counts[complaint] || 0;
      });
  
      // Add faculty complaints
      const faculty = getChiefComplaintCounts(null, "Employee");
      total[complaint] += faculty[complaint] || 0;
    });
  
    return total;
  };
  
  // Combine all page subtotals into the grand total on the last page
  const calculateGrandTotal = () => {
    const grandTotal: Record<string, number> = {};
  
    // Iterate through all pages
    for (let page = 0; page < totalPages; page++) {
      const start = page * complaintsPerPage;
      const end = Math.min(start + complaintsPerPage, allComplaints.length);
      const pageComplaints = allComplaints.slice(start, end);
  
      // Calculate subtotal for the current page
      const subtotal = calculateSubtotal(); // Correctly get subtotal for the current page
  
      // Aggregate the subtotals across pages
      pageComplaints.forEach((complaint) => {
        grandTotal[complaint] = (grandTotal[complaint] || 0) + (subtotal[complaint] || 0);
      });
    }
  
    return grandTotal;
  };
  
  const grandTotal = calculateGrandTotal();

  const renderGrandTotalRow = () => {
    const pageTotal: Record<string, number> = {};

    // Calculate subtotal for the current page
    paginatedComplaints.forEach((complaint) => {
      pageTotal[complaint] = 0;

      // Add counts for each college
      colleges.forEach((college) => {
        const counts = getChiefComplaintCounts(college, "Student");
        pageTotal[complaint] += counts[complaint] || 0;
      });

      // Add faculty/staff counts
      const facultyCounts = getChiefComplaintCounts(null, "Employee");
      pageTotal[complaint] += facultyCounts[complaint] || 0;
    });

    const total = paginatedComplaints.reduce(
      (sum, complaint) => sum + (pageTotal[complaint] || 0),
      0
    );

    return (
      <tr className="bg-gray-100 font-semibold">
        <td className="border px-4 py-2 text-left">TOTAL</td>
        {paginatedComplaints.map((complaint) => (
          <td key={complaint} className="border px-4 py-2 text-center">
            {pageTotal[complaint] || 0}
          </td>
        ))}
        <td className="border px-4 py-2 text-center">{total}</td>
      </tr>
    );
  };

  const isLastPage = currentPage === totalPages - 1 && paginatedComplaints.length <= complaintsPerPage;
  
  const generateChartData = () => {
    const facultyCounts = getChiefComplaintCounts(null, "Employee");
  
    return paginatedComplaints.map((complaint) => {
      const complaintData: Record<string, number | string> = { name: complaint };
  
      colleges.forEach((college) => {
        const complaintsCount = getChiefComplaintCounts(college, "Student");
        complaintData[college] = complaintsCount[complaint] || 0;
      });
  
      complaintData["Faculty & Staff"] = facultyCounts[complaint] || 0;
  
      return complaintData;
    });
  };

  const generatePDF = async () => {
    if (reportRef.current && chartRef.current) {
      try {
        const reportCanvas = await html2canvas(reportRef.current);
        const chartCanvas = await html2canvas(chartRef.current);
        const pdf = new jsPDF("l", "mm", [215.9, 330.2]); // Increase height to 400mm
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = 200;
        const imgWidth2 = 180;
        const imgHeight = (reportCanvas.height * imgWidth) / reportCanvas.width;
        const chartHeight = (chartCanvas.height * imgWidth2) / chartCanvas.width;
        const x = (pageWidth - imgWidth) / 2;
      
        const reportImgData = reportCanvas.toDataURL("image/png");
        const chartImgData = chartCanvas.toDataURL("image/png");
  
        const imagePath = "/assets/images/University_Annual.png";
        const img = new Image();
        img.src = imagePath;
  
        img.onload = () => {
          pdf.addImage(img, "PNG", 71, 5, 199, 31);
          pdf.setFont("Helvetica", "Bold");
          pdf.setFontSize(11);
          
          // Update report title based on filter
          if (selectedMonth) {
            const [year, month] = selectedMonth.split('-');
            const monthNames = ["January", "February", "March", "April", "May", "June", "July",
                              "August", "September", "October", "November", "December"];
            const monthName = monthNames[parseInt(month) - 1];
            pdf.text(`Medical Services Monthly Report`, 140, 45);
            pdf.text(`${monthName} ${year}`, 161, 50);
          } else {
            pdf.text("Medical Services Annual Report", 140, 45);
            pdf.text(`January - December ${new Date().getFullYear()}`, 146, 50);
          }
  
          pdf.addImage(reportImgData, "PNG", x, 55, imgWidth, imgHeight);
  
          let newY = 60 + imgHeight;
          pdf.addImage(chartImgData, "PNG", x, newY, imgWidth, chartHeight);
          pdf.save(selectedMonth ? `Medical_Services_Monthly_Report_${selectedMonth}.pdf` : "Medical_Services_Annual_Report.pdf");
        };
  
        img.onerror = (err) => {
          console.error("Error loading header image:", err);
          alert("Failed to load the header image.");
        };
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate the PDF.");
      }
    } else {
      console.error("reportRef or chartRef is missing.");
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value || null);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const clearFilter = () => {
    setSelectedMonth(null);
    setCurrentPage(0);
  };

  const getDisplayMonth = () => {
    if (!selectedMonth) return null;
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Medical Services Monthly Report</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="month"
              value={selectedMonth || ''}
              onChange={handleMonthChange}
              className="border rounded px-3 py-2 mr-2 bg-white"
              max={new Date().toISOString().slice(0, 7)}
            />
            {selectedMonth && (
              <button
                onClick={clearFilter}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Clear Filter
              </button>
            )}
          </div>
          
          <button
            onClick={generatePDF}
            className="bg-blue-700 hover:bg-white hover:text-blue-700 border-2 border-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download Report as PDF
          </button>
        </div>
      </div>

      {selectedMonth && (
        <div className="mb-4 text-lg font-semibold">
          Showing data for: {getDisplayMonth()}
        </div>
      )}

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

      <div ref={reportRef} className="mb-4">
        <table className="table-auto w-full border-collapse border">
          <thead>
            <tr className="bg-white">
              <th colSpan={allComplaints.length + 2} className=" border px-4 py-2 text-center">
                Underlying Conditions
              </th>
            </tr>
            <tr className="bg-blue-100">
              <th className=" border px-4 py-2">College/Category</th>
              {paginatedComplaints.map((complaint) => (
                <th key={complaint} className=" border px-4 py-2">{complaint}</th>
              ))}
              <th className=" border px-4 py-2">
                {isLastPage
                  ? `Total`
                  : `Total`}
              </th>
            </tr>
          </thead>
          <tbody> 
            {colleges.map((college) =>
              renderTableRows(college, "Student", `${college} Students`)
            )}
            {renderTableRows(null, "Employee", "Faculty and Staff")}
            {renderGrandTotalRow()}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div ref={chartRef} className="mb-6">
        <h2 className="flex justify-center items-center font-bold">
          {selectedMonth 
            ? `Medical Service Monthly Report - ${getDisplayMonth()}`
            : "Medical Service Annual Report"}
        </h2>
        <ResponsiveContainer width="100%" height={400} className="border">
          <BarChart data={generateChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            
            {/* Bars for each college (stacked together) */}
            {colleges.map((college, index) => (
              <Bar key={index} dataKey={college} stackId="complaints" fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
            ))}

            {/* Bar for Faculty Complaints (stacked with student complaints) */}
            <Bar dataKey="Faculty & Staff" stackId="complaints" fill="#FF5733" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MedicalServicesAnnualReport;