import { Databases, Client } from "appwrite";
import { notFound } from "next/navigation";
import Link from "next/link";
import EmailForm from "@/components/EmailForm";
import EditableField from "@/components/EditableField";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

const databases = new Databases(client);

const fetchStudent = async (userId: string) => {
  try {
    return await databases.getDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      userId
    );
  } catch (error) {
    console.error("Error fetching student details:", error);
    return null;
  }
};

const StudentDetail = async ({ params }: { params: { userId: string } }) => {
  const { userId } = await params;  // Await params here
  const student = await fetchStudent(userId);

  if (!student) notFound();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-900 text-white">
      <Link href="/admin">
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md">
          ← Back to Admin
        </button>
      </Link>

      <h1 className="text-3xl font-semibold">{student.name}'s Details</h1>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <EditableField label="Email" value={student.email} userId={userId} fieldName="email" />
          <EditableField label="Phone" value={student.phone} userId={userId} fieldName="phone" />
          <EditableField label="Gender" value={student.gender} userId={userId} fieldName="gender" />
          <EditableField label="Birth Date" value={student.birthDate} userId={userId} fieldName="birthDate" />
          <EditableField label="Age" value={student.age} userId={userId} fieldName="age" />
          <EditableField label="Address" value={student.address} userId={userId} fieldName="address" />
          <EditableField label="Occupation" value={student.occupation} userId={userId} fieldName="occupation" />
          <EditableField label="Emergency Contact Name" value={student.emergencyContactName} userId={userId} fieldName="emergencyContactName" />
          <EditableField label="Emergency Contact Number" value={student.emergencyContactNumber} userId={userId} fieldName="emergencyContactNumber" />
        </div>

        {/* Medical Information */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Medical Information</h2>
          <EditableField label="Blood Type" value={student.bloodType} userId={userId} fieldName="bloodType" />
          <EditableField label="Allergies" value={student.allergies} userId={userId} fieldName="allergies" />
          <EditableField label="Current Medication" value={student.currentMedication} userId={userId} fieldName="currentMedication" />
          <EditableField label="Family Medical History" value={student.familyMedicalHistory} userId={userId} fieldName="familyMedicalHistory" />
          <EditableField label="Past Medical History" value={student.pastMedicalHistory} userId={userId} fieldName="pastMedicalHistory" />
          <EditableField label="Primary Physician" value={student.primaryPhysician} userId={userId} fieldName="primaryPhysician" />
          <EditableField label="Insurance Provider" value={student.insuranceProvider} userId={userId} fieldName="insuranceProvider" />
          <EditableField label="Insurance Policy Number" value={student.insurancePolicyNumber} userId={userId} fieldName="insurancePolicyNumber" />
        </div>
      </div>

      {/* Identification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Identification</h2>
          <EditableField label="Identification Type" value={student.identificationType} userId={userId} fieldName="identificationType" />
          <EditableField label="Identification Number" value={student.identificationNumber} userId={userId} fieldName="identificationNumber" />
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
          <EditableField label="Year Level" value={student.yearLevel} userId={userId} fieldName="yearLevel" />
          <EditableField label="BMI Category" value={student.bmiCategory} userId={userId} fieldName="bmiCategory" />
          <EditableField label="Weight" value={student.weight} userId={userId} fieldName="weight" />
          <EditableField label="Height" value={student.height} userId={userId} fieldName="height" />
          <EditableField label="BMI" value={student.bmi} userId={userId} fieldName="bmi" />
        </div>
      </div>

      {/* Other Information */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Other Information</h2>
        <EditableField label="Religion" value={student.religion} userId={userId} fieldName="religion" />
        <EditableField label="Program" value={student.program} userId={userId} fieldName="program" />
        <EditableField label="ID Number" value={student.idNumber} userId={userId} fieldName="idNumber" />
      </div>

      <EmailForm />
    </div>
  );
};

export default StudentDetail;
