"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Databases, Client } from "appwrite";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import PrintButton from "@/components/PrintButton";
import BackToStudentButton from "@/components/BackToStudentButton";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

const databases = new Databases(client);

const StudentDetail = () => {
  const params = useParams(); 
  const userId = params.userId as string; 

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudent = async () => {
    try {
      const data = await databases.getDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
        userId
      );
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student details:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [userId]);

  if (loading) return <div className="text-white text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-900 text-white">
      <BackToStudentButton userId={userId} />

      <PrintButton student={student} />
      <h1 className="text-3xl font-semibold">{student.name}'s Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Gender:</strong> {student.gender}</p>
          <p><strong>Birth Date:</strong> {student.birthDate}</p>
          <p><strong>Age:</strong> {student.age}</p>
          <p><strong>Suffix:</strong> {student.suffix}</p>
          <p><strong>Civil Status:</strong> {student.civilStatus}</p>
          <p><strong>Person with Disability:</strong> {student.personWithDisability}</p>
          <p><strong>Address:</strong> {student.address}</p>
          <p><strong>Occupation:</strong> {student.occupation}</p>
          <p><strong>Office:</strong> {student.office}</p>
          <p><strong>Emergency Contact Name:</strong> {student.emergencyContactName}</p>
          <p><strong>Emergency Contact Number:</strong> {student.emergencyContactNumber}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Medical Information</h2>
          <p><strong>Blood Type:</strong> {student.bloodType}</p>
          <p><strong>Allergies:</strong> {student.allergies}</p>
          <p><strong>Current Medication:</strong> {student.currentMedication}</p>
          <p><strong>Family Medical History:</strong> {student.familyMedicalHistory}</p>
          <p><strong>Past Medical History:</strong> {student.pastMedicalHistory}</p>
          <p><strong>Primary Physician:</strong> {student.primaryPhysician}</p>
          <p><strong>Insurance Provider:</strong> {student.insuranceProvider}</p>
          <p><strong>Insurance Policy Number:</strong> {student.insurancePolicyNumber}</p>
          <p><strong>Disability Type:</strong> {student.disabilityType}</p>
          <p><strong>Disability Details:</strong> {student.disabilityDetails}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Identification</h2>
          <p><strong>Identification Type:</strong> {student.identificationType}</p>
          <p><strong>Identification Number:</strong> {student.identificationNumber}</p>
          <p><strong>Student Identification Number:</strong> {student.idNumber}</p>
          <p>
            <strong>Identification Document:</strong>{" "}
            <a href={student.identificationDocumentUrl} target="_blank" className="text-blue-400">
              View Document
            </a>
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Health Information</h2>
          <p><strong>Year Level:</strong> {student.yearLevel}</p>
          <p><strong>BMI Category:</strong> {student.bmiCategory}</p>
          <p><strong>Weight:</strong> {student.weight}</p>
          <p><strong>Height:</strong> {student.height}</p>
          <p><strong>BMI:</strong> {student.bmi}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
