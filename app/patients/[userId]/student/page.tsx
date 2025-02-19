"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Databases, Client } from "appwrite";
import { Button } from "@/components/ui/button";
import StudentSideBar from "@/components/StudentSideBar";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

const databases = new Databases(client);

const StudentPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [student, setStudent] = useState<any>(null);

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

    fetchStudent();
  }, [userId]);

  if (!student) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSideBar userId={userId} />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {student.name}!</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Overview</h2>
            
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

            <Button 
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
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