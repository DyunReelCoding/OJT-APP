"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Databases, Client } from "appwrite";
import { notFound } from "next/navigation";
import dayjs from "dayjs"; // Import dayjs
import PrintButton from "@/components/PrintButton";
import BackToStudentButton from "@/components/BackToStudentButton";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

const databases = new Databases(client);

const StudentDetail = () => {
  const params = useParams();
  // @ts-ignore

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

  // Calculate age dynamically
  const birthDate = student.birthDate;
  const age = birthDate ? dayjs().diff(dayjs(birthDate), "year") : "N/A";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-white text-black">
      <BackToStudentButton userId={userId} />
      <PrintButton student={student} />

      <h1 className="text-3xl font-semibold text-black">{student.name}'s Details</h1>

      {[
        {
          title: "Personal Information",
          data: [
            ["Email", student.email],
            ["Phone", student.phone],
            ["Gender", student.gender],
            ["Birth Date", student.birthDate],
            ["Age", age], // Use dynamically calculated age
            ["Suffix", student.suffix],
            ["Civil Status", student.civilStatus],
            ["Person with Disability", student.personWithDisability],
            ["Address", student.address],
            ["Occupation", student.occupation],
            ["College", student.college],
            ["Emergency Contact Name", student.emergencyContactName],
            ["Emergency Contact Number", student.emergencyContactNumber],
          ],
        },
        {
          title: "Medical Information",
          data: [
            ["Blood Type", student.bloodType],
            ["Allergies", student.allergies],
            ["Current Medication", student.currentMedication],
            ["Family Medical History", student.familyMedicalHistory],
            ["Past Medical History", student.pastMedicalHistory],
            ["Primary Physician", student.primaryPhysician],
            ["Insurance Provider", student.insuranceProvider],
            ["Insurance Policy Number", student.insurancePolicyNumber],
            ["Disability Type", student.disabilityType],
            ["Disability Details", student.disabilityDetails],
          ],
        },
        {
          title: "Identification",
          data: [
            ["Identification Type", student.identificationType],
            ["Identification Number", student.identificationNumber],
            ["Student Identification Number", student.idNumber],
            [
              "Identification Document",
              <a
                href={student.identificationDocumentUrl}
                target="_blank"
                className="text-blue-400"
              >
                View Document
              </a>,
            ],
          ],
        },
        {
          title: "Health Information",
          data: [
            ["Year Level", student.yearLevel],
            ["BMI Category", student.bmiCategory],
            ["Weight", student.weight],
            ["Height", student.height],
            ["BMI", student.bmi],
          ],
        },
      ].map((section, index) => (
        <div
          key={index}
          className="bg-gray-50 p-6 rounded-lg shadow-md border-2 border-blue-700"
        >
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            {section.title}
          </h2>
          <table className="w-full border-collapse border border-gray-700">
            <tbody>
              {section.data.map(([label, value]) => (
                <tr key={label} className="border border-gray-700">
                  <td className="p-2 font-bold w-1/2 bg-blue-50 text-blue-700">
                    {label}
                  </td>
                  <td className="p-2">{value || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default StudentDetail;
