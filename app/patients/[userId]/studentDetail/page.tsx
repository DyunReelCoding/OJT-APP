"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Databases, Client } from "appwrite";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import EditableField from "@/components/EditableField";
import EmailForm from "@/components/EmailForm";
import PrintButton from "@/components/PrintButton";

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

  const handleUpdate = (fieldName: string, newValue: string) => {
    setStudent((prev: any) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-900 text-white">
      <BackButton />
      <PrintButton student={student} />
      <h1 className="text-3xl font-semibold">{student.name}'s Details</h1>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <EditableField label="Email" value={student.email} userId={userId} fieldName="email" onUpdate={handleUpdate} />
          <EditableField label="Phone" value={student.phone} userId={userId} fieldName="phone" onUpdate={handleUpdate} />
          <EditableField label="Gender" value={student.gender} userId={userId} fieldName="gender" onUpdate={handleUpdate} />
          <EditableField label="Birth Date" value={student.birthDate} userId={userId} fieldName="birthDate" onUpdate={handleUpdate} />
          <EditableField label="Age" value={student.age} userId={userId} fieldName="age" onUpdate={handleUpdate} />
          <EditableField label="Suffix" value={student.suffix} userId={userId} fieldName="suffix" onUpdate={handleUpdate} />
          <EditableField label="Civil Status" value={student.civilStatus} userId={userId} fieldName="civilStatus" onUpdate={handleUpdate} />
          <EditableField label="Person with Disability" value={student.personWithDisability} userId={userId} fieldName="personWithDisability" onUpdate={handleUpdate} />
          <EditableField label="Address" value={student.address} userId={userId} fieldName="address" onUpdate={handleUpdate} />
          <EditableField label="Occupation" value={student.occupation} userId={userId} fieldName="occupation" onUpdate={handleUpdate} />
          <EditableField label="Emergency Contact Name" value={student.emergencyContactName} userId={userId} fieldName="emergencyContactName" onUpdate={handleUpdate} />
          <EditableField label="Emergency Contact Number" value={student.emergencyContactNumber} userId={userId} fieldName="emergencyContactNumber" onUpdate={handleUpdate} />
        </div>

        {/* Medical Information */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Medical Information</h2>
          <EditableField label="Blood Type" value={student.bloodType} userId={userId} fieldName="bloodType" onUpdate={handleUpdate} />
          <EditableField label="Allergies" value={student.allergies} userId={userId} fieldName="allergies" onUpdate={handleUpdate} />
          <EditableField label="Current Medication" value={student.currentMedication} userId={userId} fieldName="currentMedication" onUpdate={handleUpdate} />
          <EditableField label="Family Medical History" value={student.familyMedicalHistory} userId={userId} fieldName="familyMedicalHistory" onUpdate={handleUpdate} />
          <EditableField label="Past Medical History" value={student.pastMedicalHistory} userId={userId} fieldName="pastMedicalHistory" onUpdate={handleUpdate} />
          <EditableField label="Primary Physician" value={student.primaryPhysician} userId={userId} fieldName="primaryPhysician" onUpdate={handleUpdate} />
          <EditableField label="Insurance Provider" value={student.insuranceProvider} userId={userId} fieldName="insuranceProvider" onUpdate={handleUpdate} />
          <EditableField label="Insurance Policy Number" value={student.insurancePolicyNumber} userId={userId} fieldName="insurancePolicyNumber" onUpdate={handleUpdate} />
          <EditableField label="Person with Disability" value={student.personWithDisability} userId={userId} fieldName="personWithDisability" onUpdate={handleUpdate} />
          <EditableField label="Disability Type" value={student.disabilityType} userId={userId} fieldName="disabilityType" onUpdate={handleUpdate} />
          <EditableField label="Disability Details" value={student.disabilityDetails} userId={userId} fieldName="disabilityDetails" onUpdate={handleUpdate} />
        </div>
      </div>

      {/* Identification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Identification</h2>
          <EditableField label="Identification Type" value={student.identificationType} userId={userId} fieldName="identificationType" onUpdate={handleUpdate} />
          <EditableField label="Identification Number" value={student.identificationNumber} userId={userId} fieldName="identificationNumber" onUpdate={handleUpdate} />
          <EditableField label="Student Identification Number" value={student.idNumber} userId={userId} fieldName="idNumber" onUpdate={handleUpdate} />
          <p>
            <strong>Identification Document:</strong>{" "}
            <a href={student.identificationDocumentUrl} target="_blank" className="text-blue-400">
              View Document
            </a>
          </p>
        </div>

        {/* Health Info */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Health Information</h2>
          <EditableField label="Year Level" value={student.yearLevel} userId={userId} fieldName="yearLevel" onUpdate={handleUpdate} />
          <EditableField label="BMI Category" value={student.bmiCategory} userId={userId} fieldName="bmiCategory" onUpdate={handleUpdate} />
          <EditableField label="Weight" value={student.weight} userId={userId} fieldName="weight" onUpdate={handleUpdate} />
          <EditableField label="Height" value={student.height} userId={userId} fieldName="height" onUpdate={handleUpdate} />
          <EditableField label="BMI" value={student.bmi} userId={userId} fieldName="bmi" onUpdate={handleUpdate} />
        </div>
      </div>

      <EmailForm studentEmail={student.email} />
    </div>
  );
};

export default StudentDetail;
