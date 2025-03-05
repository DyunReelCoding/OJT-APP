"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Databases, Client, Storage } from "appwrite";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import EditableField from "@/components/EditableField";
import EmailForm from "@/components/EmailForm";
import PrintButton from "@/components/PrintButton";
import { ChevronDown, ChevronUp } from "lucide-react"; // Icons for expand/collapse
import { Button } from "@/components/ui/button"; // Import the Button component
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!)
  //.setKey(process.env.API_KEY!); // Ensure the API key is set

const databases = new Databases(client);
const storage = new Storage(client);

const StudentDetail = () => {
  const params = useParams();
  const userId = params.userId as string;

  const [student, setStudent] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDiagnosisId, setExpandedDiagnosisId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [messageHistory, setMessageHistory] = useState("");
  const [isSuccessHistory, setIsSuccessHistory] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Diet Recommendation Form State
  const [dietNote, setDietNote] = useState("");
  const [dietImage, setDietImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collapsible state for diet recommendation history
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

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

  useEffect(() => {
    fetchStudent();
    fetchAppointments();
  }, [userId]);

  if (loading) return <div className="text-white text-center">Loading...</div>;

  const handleUpdate = (fieldName: string, newValue: string) => {
    setStudent((prev: any) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  // Toggle expanded diagnosis
  const toggleDiagnosis = (appointmentId: string) => {
    setExpandedDiagnosisId(expandedDiagnosisId === appointmentId ? null : appointmentId);
  };

  const handleDietRecommendationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      let imageUrl = "";
  
      if (dietImage) {
        try {
          const response = await storage.createFile(
            process.env.NEXT_PUBLIC_BUCKET_ID!,
            "unique()",
            dietImage
          );
          imageUrl = `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECT_ID}`;
        } catch (error) {
          console.error("Error uploading image:", error);
          throw error;
        }
      }
  
      const newDietRecommendation = {
        note: dietNote,
        imageUrl: imageUrl,
        timestamp: new Date().toISOString(),
      };
  
      const existingRecommendations = student.dietRecommendations
        ? JSON.parse(student.dietRecommendations)
        : [];
  
      const updatedRecommendations = [...existingRecommendations, newDietRecommendation];
  
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
        userId,
        {
          dietRecommendation: dietNote,
          dietImageUrl: imageUrl,
          dietRecommendations: JSON.stringify(updatedRecommendations),
        }
      );
  
      fetchStudent();
      setDietNote("");
      setDietImage(null);
      setMessage("Diet recommendation sent successfully!");
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
      setIsSuccess(true);
    } catch (error) {
      console.error("Error sending diet recommendation:", error);
      setMessage("Failed to send diet recommendation.");
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteRecommendation = async () => {
    if (deleteIndex === null || !student || !student.dietRecommendations) return;

    try {
      const existingRecommendations = JSON.parse(student.dietRecommendations);
      const isLatestRecommendation = deleteIndex === existingRecommendations.length - 1;

      const updatedRecommendations = existingRecommendations.filter(
        (_: any, i: number) => i !== deleteIndex
      );

      const updateData: any = {
        dietRecommendations: JSON.stringify(updatedRecommendations),
      };

      if (isLatestRecommendation) {
        updateData.dietRecommendation = "";
        updateData.dietImageUrl = "";
      }

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
        userId,
        updateData
      );

      fetchStudent();
      setIsDeleteModalOpen(false);
      setDeleteIndex(null);
      setMessageHistory("Diet Deleted successfully!");
      setTimeout(() => setMessageHistory(""), 3000); // Clear message after 3 seconds
      setIsSuccessHistory(true);
    } catch (error) {
      console.error("Error deleting recommendation:", error);
    }
  };

  const openDeleteModal = (index: number) => {
    setDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-900 text-white">
      <BackButton />
      <PrintButton student={student} />
      <h1 className="text-3xl font-semibold">{student.name}'s Details</h1>

      {/* Personal Information */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <hr className="border-gray-700 my-3" />
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
              <tr key={field} className="border-b border-gray-700 last:border-none">
                <td className="p-3 font-medium w-1/3">{label}</td>
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
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Medical Information</h2>
        <hr className="border-gray-700 my-3" />
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
              <tr key={field} className="border-b border-gray-700 last:border-none">
                <td className="p-3 font-medium w-1/3">{label}</td>
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
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Identification</h2>
        <hr className="border-gray-700 my-3" />
        <table className="w-full border-collapse">
          <tbody>
            {[
              ["Identification Type", "identificationType"],
              ["Identification Number", "identificationNumber"],
              ["School ID Number", "idNumber"],
            ].map(([label, field]) => (
              <tr key={field} className="border-b border-gray-700 last:border-none">
                <td className="p-3 font-medium w-1/3">{label}</td>
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
            <tr className="border-b border-gray-700 last:border-none">
              <td className="p-3 font-medium w-1/3">Identification Document</td>
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
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Health Information</h2>
        <hr className="border-gray-700 my-3" />
        <table className="w-full border-collapse">
          <tbody>
            {[
              ["Year Level", "yearLevel"],
              ["BMI Category", "bmiCategory"],
              ["Weight", "weight"],
              ["Height", "height"],
              ["BMI", "bmi"],
            ].map(([label, field]) => (
              <tr key={field} className="border-b border-gray-700 last:border-none">
                <td className="p-3 font-medium w-1/3">{label}</td>
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

      {/* Diagnosis Information */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Diagnosis Information</h2>
        <hr className="border-gray-700 my-3" />
        {appointments
          .filter((appointment) => appointment.status === "Completed" && appointment.diagnosis)
          .map((appointment) => (
            <div key={appointment.$id} className="mb-4 border rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDiagnosis(appointment.$id)}
              >
                <div>
                  <p className="text-gray-200"><strong>Date:</strong> {appointment.date}</p>
                  <p className="text-gray-200"><strong>Time:</strong> {appointment.time}</p>
                </div>
                <div>
                  {expandedDiagnosisId === appointment.$id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              {expandedDiagnosisId === appointment.$id && (
                <div className="mt-4">
                  <p className="text-gray-200"><strong>Blood Pressure:</strong> {JSON.parse(appointment.diagnosis).bloodPressure}</p>
                  <p className="text-gray-200"><strong>Chief Complaint:</strong> {JSON.parse(appointment.diagnosis).chiefComplaint}</p>
                  <p className="text-gray-200"><strong>Notes:</strong> {JSON.parse(appointment.diagnosis).notes}</p>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Diet Recommendation Form */}
<div className="bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold">Send Diet Recommendation</h2>
  <hr className="border-gray-700 my-3" />
  <form onSubmit={handleDietRecommendationSubmit}>
    <div className="space-y-4">
      <textarea
        placeholder="Enter diet recommendation note..."
        value={dietNote}
        onChange={(e) => setDietNote(e.target.value)}
        className="w-full p-2 bg-gray-700 text-white rounded-lg"
        rows={4}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setDietImage(e.target.files?.[0] || null)}
        className="w-full p-2 bg-gray-700 text-white rounded-lg"
      />
      <Button
        type="submit"
        className="bg-blue-700 hover:bg-blue-500 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Recommendation"}
      </Button>
    </div>
  </form>

  {/* Display message after submission */}
  {message && (
    <p className={`mt-3 text-sm ${isSuccess ? "text-green-500" : "text-red-500"}`}>
      {message}
    </p>
  )}
</div>


{/* Diet Recommendation History */}
<div className="bg-gray-800 p-6 rounded-lg shadow-md">
  <div
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
  >
    <h2 className="text-xl font-semibold">Diet Recommendation History</h2>
    <div>
      {isHistoryExpanded ? (
        <ChevronUp className="h-5 w-5 text-gray-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-400" />
      )}
    </div>
  </div>
  {isHistoryExpanded && (
    <div className="mt-4">
      {isSuccessHistory && messageHistory && (
  <div className="bg-green-500 text-white p-3 rounded-lg mb-4">
    {messageHistory}
  </div>
)}

      {student.dietRecommendations ? (
        JSON.parse(student.dietRecommendations).length > 0 ? (
          JSON.parse(student.dietRecommendations).map((recommendation: any, index: number) => (
            <div key={index} className="mb-4 border rounded-lg p-4 relative">
              <button 
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg shadow hover:bg-red-700" 
                onClick={() => openDeleteModal(index)}
              >
                Delete
              </button>
              <p className="text-gray-200"><strong>Note:</strong> {recommendation.note}</p>
              {recommendation.imageUrl && (
                <div className="mt-2">
                  <img
                    src={recommendation.imageUrl}
                    alt="Diet Recommendation"
                    className="w-full max-w-md rounded-lg shadow-md"
                  />
                </div>
              )}
              <p className="text-gray-200"><strong>Date:</strong> {new Date(recommendation.timestamp).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-200">No recommendations found.</p>
        )
      ) : (
        <p className="text-gray-200">No recommendations found.</p>
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRecommendation}
      />
    </div>
  )}
</div>
      <EmailForm studentEmail={student.email} />
    </div>
  );
};

export default StudentDetail;