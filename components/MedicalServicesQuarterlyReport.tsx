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
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
    fetchColleges();
  }, []);

  useEffect(() => {
    if (selectedQuarter && selectedYear) {
      const year = parseInt(selectedYear);
      const quarterStartMonth = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 }[selectedQuarter];
  
      const start = new Date(year, quarterStartMonth, 1);
      const end = new Date(year, quarterStartMonth + 3, 0); // end of the quarter
  
      const filtered = appointments.filter((appointment) => {
        const date = new Date(appointment.date);
        return date >= start && date <= end;
      });
  
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [selectedQuarter, selectedYear, appointments]);
  

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
          patientGenderMap[patient.name] = patient.gender; // Using patientName as key
        });
    
        // Combine appointment data with gender
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
// Update the useEffect for filtering to combine both quarter and gender filters
// Update your quarter filter useEffect
useEffect(() => {
  let filtered = [...appointments];

  // Apply quarter filter first if selected
  if (selectedQuarter && selectedYear) {
    const year = parseInt(selectedYear);
    const quarterMap = {
      'Q1 (Jan - Mar)': { startMonth: 0, endMonth: 2 },
      'Q2 (Apr - Jun)': { startMonth: 3, endMonth: 5 },
      'Q3 (Jul - Sep)': { startMonth: 6, endMonth: 8 },
      'Q4 (Oct - Dec)': { startMonth: 9, endMonth: 11 }
    };
    
    const quarter = quarterMap[selectedQuarter as keyof typeof quarterMap];
    
    if (!quarter) {
      console.error('Invalid quarter selected:', selectedQuarter);
      return;
    }

    const start = new Date(year, quarter.startMonth, 1);
    const end = new Date(year, quarter.endMonth + 1, 0); // Last day of end month

    filtered = filtered.filter((appointment) => {
      try {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= start && appointmentDate <= end;
      } catch (error) {
        console.error('Invalid date format:', appointment.date);
        return false;
      }
    });
  }

  // Then apply gender filter if selected
  if (selectedGender) {
    filtered = filtered.filter(appointment => 
      appointment.gender?.toLowerCase() === selectedGender.toLowerCase()
    );
  }

  setFilteredAppointments(filtered);
}, [selectedQuarter, selectedYear, selectedGender, appointments]);

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
          if (selectedQuarter && selectedYear) {
            pdf.text("Medical Services Quarterly Report", 140, 45);
            pdf.text(`${selectedQuarter} ${selectedYear}`, 161, 50);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Medical Services Report</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className='space-x-4'>
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
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border rounded px-3 py-2 bg-white text-blue-700"
            >
              <option value="">Select Quarter</option>
              <option value="Q1 (Jan - Mar)">Q1 (Jan - Mar)</option>
              <option value="Q2 (Apr - Jun)">Q2 (Apr - Jun)</option>
              <option value="Q3 (Jul - Sep)">Q3 (Jul - Sep)</option>
              <option value="Q4 (Oct - Dec)">Q4 (Oct - Dec)</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border rounded px-3 py-2 bg-white text-blue-700 "
            >
              <option value="">Select Year</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            </div>

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
            Download Report
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