import { useEffect, useState, useRef } from "react";
import { Client, Databases } from "appwrite";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
        <td className="border px-4 py-2 text-left">TOTAL</td>
        {allComplaints.map((complaint) => (
          <td key={complaint} className="border px-4 py-2 text-center">
            {grandTotal[complaint] || 0}
          </td>
        ))}
        <td className="border px-4 py-2 text-center">{total}</td>
      </tr>
    );
  };

  const generatePDF = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save("Medical_Services_Annual_Report.pdf");
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Medical Services Annual Report</h1>
      <div ref={reportRef} className="mb-4">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-4 py-2">College/Category</th>
              {Array.from(
                new Set(
                  appointments.flatMap(
                    (a) => JSON.parse(a.diagnosis)?.chiefComplaint || []
                  )
                )
              )
                .filter((complaint) => complaint.trim() !== "") // Skip "Unknown"
                .map((complaint) => (
                  <th key={complaint} className="border px-4 py-2">
                    {complaint}
                  </th>
                ))}
              <th className="border px-4 py-2">Sub-Total</th>
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
