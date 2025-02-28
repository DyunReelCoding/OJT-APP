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
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-white">
      <BackButton />
      <PrintButton student={student} />
      <h1 className="text-3xl font-semibold text-black">{student.name}'s Details</h1>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-700 text-black">
        <h2 className="text-2xl font-semibold text-blue-700 mb-5">Personal Information</h2>
        <table className="w-full border-collapse">
          <tbody>
            {[
              ["Email", "email"],
              ["Phone", "phone"],
              ["Gender", "gender"],
              ["Birth Date", "birthDate"],
              ["Age", "age"],
              ["Suffix", "suffix"],
              ["Civil Status", "civilStatus"],
              ["Person with Disability", "personWithDisability"],
              ["Address", "address"],
              ["Occupation", "occupation"],
              ["Office", "office"],
              ["Emergency Contact Name", "emergencyContactName"],
              ["Emergency Contact Number", "emergencyContactNumber"],
            ].map(([label, field]) => (
              <tr key={field} className="border border-gray-700">
                <td className="p-3 font-semibold w-1/2 text-blue-700 bg-blue-50">{label}</td>
                <td className="p-3">
                  <EditableField
                    label={label}
                    value={student[field]}
                    userId={userId}
                    fieldName={field}
                    onUpdate={handleUpdate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Medical Information */}
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-700 text-black">
        <h2 className="text-2xl font-semibold text-blue-700 mb-5">Medical Information</h2>
        <table className="w-full border-collapse">
          <tbody>
            {[
              ["Blood Type", "bloodType"],
              ["Allergies", "allergies"],
              ["Current Medication", "currentMedication"],
              ["Family Medical History", "familyMedicalHistory"],
              ["Past Medical History", "pastMedicalHistory"],
              ["Primary Physician", "primaryPhysician"],
              ["Insurance Provider", "insuranceProvider"],
              ["Insurance Policy Number", "insurancePolicyNumber"],
              ["Disability Type", "disabilityType"],
              ["Disability Details", "disabilityDetails"],
            ].map(([label, field]) => (
              <tr key={field} className="border border-gray-700">
                <td className="p-3 font-semibold w-1/2 text-blue-700 bg-blue-50">{label}</td>
                <td className="p-3">
                  <EditableField
                    label={label}
                    value={student[field]}
                    userId={userId}
                    fieldName={field}
                    onUpdate={handleUpdate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Identification */}
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-700 text-black">
        <h2 className="text-2xl font-semibold text-blue-700 mb-5">Identification</h2>
        <table className="w-full border-collapse">
          <tbody>
            {[
              ["Identification Type", "identificationType"],
              ["Identification Number", "identificationNumber"],
              ["School ID Number", "idNumber"],
            ].map(([label, field]) => (
              <tr key={field} className="border border-gray-700">
                <td className="p-3 font-semibold w-1/2 text-blue-700 bg-blue-50">{label}</td>
                <td className="p-3">
                  <EditableField
                    label={label}
                    value={student[field]}
                    userId={userId}
                    fieldName={field}
                    onUpdate={handleUpdate}
                  />
                </td>
              </tr>
            ))}
            <tr className="border border-gray-700">
              <td className="p-3 font-semibold w-1/2 text-blue-700 bg-blue-50">Identification Document</td>
              <td className="p-3">
                <a href={student.identificationDocumentUrl} target="_blank" className="text-blue-400">
                  View Document
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Health Information */}
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-700 text-black">
        <h2 className="text-2xl font-semibold text-blue-700 mb-5">Health Information</h2>
        <table className="w-full border-collapse">
          <tbody>
            {[
              ["Year Level", "yearLevel"],
              ["BMI Category", "bmiCategory"],
              ["Weight", "weight"],
              ["Height", "height"],
              ["BMI", "bmi"],
            ].map(([label, field]) => (
              <tr key={field} className="border border-gray-700">
                <td className="p-3 font-semibold w-1/2 text-blue-700 bg-blue-50">{label}</td>
                <td className="p-3">
                  <EditableField
                    label={label}
                    value={student[field]}
                    userId={userId}
                    fieldName={field}
                    onUpdate={handleUpdate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EmailForm studentEmail={student.email} />
    </div>
  );
};

export default StudentDetail;
