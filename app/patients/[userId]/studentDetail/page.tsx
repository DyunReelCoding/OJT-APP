import { Databases } from "appwrite";
import { Client } from "appwrite";
import { notFound } from "next/navigation";
import Link from "next/link";

// Configure Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!) 
  .setProject(process.env.PROJECT_ID!); 

const databases = new Databases(client);

const fetchStudent = async (userId: string) => {
  try {
    const response = await databases.getDocument(
      process.env.DATABASE_ID!, 
      process.env.PATIENT_COLLECTION_ID!, 
      userId 
    );
    return response;
  } catch (error) {
    console.error("Error fetching student details:", error);
    return null;
  }
};

// StudentDetail Page Component (Server Component)
const StudentDetail = async ({ params }: { params: { userId: string } }) => {
  const { userId } = params; // Get userId from URL parameters

  const student = await fetchStudent(userId); // Fetch student data from Appwrite

  if (!student) {
    notFound(); // If no student found, show 404
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-900 text-white">
      {/* Back to Admin Button */}
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
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Gender:</strong> {student.gender}</p>
          <p><strong>Birth Date:</strong> {student.birthDate}</p>
          <p><strong>Age:</strong> {student.age}</p>
          <p><strong>Address:</strong> {student.address}</p>
          <p><strong>Occupation:</strong> {student.occupation}</p>
          <p><strong>Emergency Contact Name:</strong> {student.emergencyContactName}</p>
          <p><strong>Emergency Contact Number:</strong> {student.emergencyContactNumber}</p>
        </div>

        {/* Medical Information */}
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
        </div>
      </div>

      {/* Identification and Consent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Identification and Consent</h2>
          <p><strong>Identification Type:</strong> {student.identificationType}</p>
          <p><strong>Identification Number:</strong> {student.identificationNumber}</p>
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
          <p><strong>Year Level:</strong> {student.yearLevel}</p>
          <p><strong>BMI Category:</strong> {student.bmiCategory}</p>
          <p><strong>Weight:</strong> {student.weight}</p>
          <p><strong>Height:</strong> {student.height}</p>
          <p><strong>BMI:</strong> {student.bmi}</p>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Other Information</h2>
        <p><strong>Religion:</strong> {student.religion}</p>
        <p><strong>Program:</strong> {student.program}</p>
        <p><strong>ID Number:</strong> {student.idNumber}</p>
      </div>
    </div>
  );
};

export default StudentDetail;
