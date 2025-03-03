"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Databases, Client } from "appwrite";
import { Button } from "@/components/ui/button";
import StudentSideBar from "@/components/StudentSideBar";
import { ChevronDown, ChevronUp } from "lucide-react"; // Icons for expand/collapse

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

const databases = new Databases(client);

const StudentPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [student, setStudent] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [expandedDiagnosisId, setExpandedDiagnosisId] = useState<string | null>(null); // Track expanded diagnosis

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await databases.getDocument(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
          userId
        );
        setStudent(data);
      } catch (error) {
        console.error("Error fetching student:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          "67b96b0800349392bb1c" // Replace with your appointment collection ID
        );
        const userAppointments = response.documents.filter(
          (doc: any) => doc.userid === userId
        );
        setAppointments(userAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchStudent();
    fetchAppointments();
  }, [userId]);

  if (!student) return <div>Loading...</div>;

  // Toggle expanded diagnosis
  const toggleDiagnosis = (appointmentId: string) => {
    setExpandedDiagnosisId(expandedDiagnosisId === appointmentId ? null : appointmentId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSideBar userId={userId} />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {student.name}!</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Quick Overview</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-medium text-gray-600">Program:</p>
                <p className="text-gray-800">{student.program}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Year Level:</p>
                <p className="text-gray-800">{student.yearLevel}</p>
              </div>
            </div>

            {/* Display Diet Recommendation */}
            {student.dietRecommendation && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-green-700 mb-2">Diet Recommendation</h3>
                <p className="text-gray-800">{student.dietRecommendation}</p>
              </div>
            )}

            {/* Diagnosis Section */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-green-700 mb-2">Diagnosis History</h3>
              {appointments
                .filter((appointment) => appointment.status === "Completed" && appointment.diagnosis)
                .map((appointment) => (
                  <div key={appointment.$id} className="mb-4 border rounded-lg p-4">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleDiagnosis(appointment.$id)}
                    >
                      <div>
                        <p className="text-gray-800"><strong>Date:</strong> {appointment.date}</p>
                        <p className="text-gray-800"><strong>Time:</strong> {appointment.time}</p>
                      </div>
                      <div>
                        {expandedDiagnosisId === appointment.$id ? (
                          <ChevronUp className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                    </div>
                    {expandedDiagnosisId === appointment.$id && (
                      <div className="mt-4">
                        <p className="text-gray-800"><strong>Blood Pressure:</strong> {JSON.parse(appointment.diagnosis).bloodPressure}</p>
                        <p className="text-gray-800"><strong>Chief Complaint:</strong> {JSON.parse(appointment.diagnosis).chiefComplaint}</p>
                        <p className="text-gray-800"><strong>Notes:</strong> {JSON.parse(appointment.diagnosis).notes}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <Button 
              className="mt-6 bg-blue-700 hover:bg-blue-500 text-white"
              onClick={() => router.push(`/patients/${userId}/studentDetail`)}
            >
              View My Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;