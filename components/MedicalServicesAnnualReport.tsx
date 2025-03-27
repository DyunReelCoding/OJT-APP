import { useEffect, useState, useRef } from "react";
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

const MedicalServicesAnnualReport = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const colleges = ["CMNS", "CHaSS", "CAA", "CCIS", "COFES", "CEGS", "CED"];

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c"
      );
      setAppointments(response.documents as Appointment[]);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const getChiefComplaintCounts = (college: string | null, occupation: string | null) => {
    const complaintsCount: Record<string, number> = {};

    appointments.forEach((appointment) => {
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
      appointments.flatMap((a) => JSON.parse(a.diagnosis)?.chiefComplaint || [])
    )
  ).filter((complaint) => complaint.trim() !== "");


  const renderTableRows = (college: string | null, occupation: string | null, label: string) => {
    const complaints = getChiefComplaintCounts(college, occupation);
    const total = Object.values(complaints).reduce((acc, count) => acc + count, 0);

    return (
      <tr key={label}>
        <td className="border px-4 py-2 font-bold text-left">{label}</td>
        {Array.from(
          new Set(
            appointments.flatMap(
              (a) => JSON.parse(a.diagnosis)?.chiefComplaint || []
            )
          )
        )
          .filter((complaint) => complaint.trim() !== "") // Skip "Unknown"
          .map((complaint) => (
            <td key={complaint} className="border px-4 py-2 text-center">
              {complaints[complaint] || 0}
            </td>
          ))}
        <td className="border px-4 py-2 font-bold text-center">{total}</td>
      </tr>
    );
  };

   const renderGrandTotalRow = () => {
    const grandTotal: Record<string, number> = {};

    colleges.forEach((college) => {
      const counts = getChiefComplaintCounts(college, "Student");
      for (const [reason, count] of Object.entries(counts)) {
        grandTotal[reason] = (grandTotal[reason] || 0) + count;
      }
    });

    const facultyCounts = getChiefComplaintCounts(null, "Employee");
    for (const [reason, count] of Object.entries(facultyCounts)) {
      grandTotal[reason] = (grandTotal[reason] || 0) + count;
    }

    const total = Object.values(grandTotal).reduce((acc, count) => acc + count, 0);

    return (
      <tr className="bg-gray-200 font-bold">
        <td className=" border-black px-4 py-2 text-left">TOTAL</td>
        {allComplaints.map((complaint) => (
          <td key={complaint} className=" border-black px-4 py-2 text-center">
            {grandTotal[complaint] || 0}
          </td>
        ))}
        <td className=" border-black px-4 py-2 text-center">{total}</td>
      </tr>
    );
  };

  const generateChartData = () => {
    // Get faculty complaints for employees (assumed to be global)
    const facultyCounts = getChiefComplaintCounts(null, "Employee");
  
    return allComplaints.map((complaint) => {
      const complaintData: Record<string, number | string> = { name: complaint };
  
      // Student complaints (grouped by college)
      colleges.forEach((college) => {
        const complaintsCount = getChiefComplaintCounts(college, "Student");
        complaintData[college] = complaintsCount[complaint] || 0;
      });
  
      // Faculty complaints (for employees)
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
          pdf.text("Medical Services Annual Report", 140, 45);
          pdf.text(`January - December ${new Date().getFullYear()}`, 146, 50);
  
          pdf.addImage(reportImgData, "PNG", x, 55, imgWidth, imgHeight);
  
          let newY = 60 + imgHeight;
          pdf.addImage(chartImgData, "PNG", x, newY, imgWidth, chartHeight);
          pdf.save("Medical_Services_Annual_Report.pdf");
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Medical Services Annual Report</h1>
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
              {allComplaints.map((complaint) => (
                <th key={complaint} className=" border px-4 py-2">{complaint}</th>
              ))}
              <th className=" border px-4 py-2">Sub-Total</th>
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
        <h2 className="flex justify-center items-center font-bold">Medical Service Annual Report</h2>
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

      <button
        onClick={generatePDF}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Download Report as PDF
      </button>
    </div>
  );
};

export default MedicalServicesAnnualReport;
