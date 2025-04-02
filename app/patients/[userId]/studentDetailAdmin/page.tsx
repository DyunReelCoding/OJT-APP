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
import MedicalClearanceForm from "@/components/MedicalClearance";
import MedicalRecord from "@/components/MedicalRecord";
import { FaCamera } from "react-icons/fa";
import dayjs from "dayjs";

declare global {
  interface Window {
    activeStream?: MediaStream;
  }
}

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

  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedMedicalRecord, setIsExpandedMedicalRecord] = useState(false);

  const toggleExpandMedicalRecord = () => setIsExpandedMedicalRecord(!isExpandedMedicalRecord);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const calculateAge = (birthDate: string | number | dayjs.Dayjs | Date | null | undefined) => {
    return birthDate ? dayjs().diff(dayjs(birthDate), "year") : "N/A";
  };
  

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
      setMessage("Wellness Notes. sent successfully!");
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
      setIsSuccess(true);
    } catch (error) {
      console.error("Error sending Wellness Notes:", error);
      setMessage("Failed to send Wellness Notes.");
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
      console.error("Error deleting Wellness Notes:", error);
    }
  };

  const openDeleteModal = (index: number) => {
    setDeleteIndex(index);
    setIsDeleteModalOpen(true);
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
          ["Age", "age"], // Age will be handled separately
          ["Suffix", "suffix"],
          ["Civil Status", "civilStatus"],
          ["Person with Disability", "personWithDisability"],
          ["Address", "address"],
          ["Occupation", "occupation"],
          ["Office", "office"],
          ["College", "college"],
          ["Emergency Contact Name", "emergencyContactName"],
          ["Emergency Contact Number", "emergencyContactNumber"],
        ]
          .filter(([_, field]) => student[field] && student[field] !== "None")
          .map(([label, field]) => (
          <tr key={field} className="border border-gray-700">
            <td className="p-3 font-semibold w-1/2 text-blue-700 bg-blue-50">{label}</td>
            <td className="p-3">
              {field === "age" ? (
                calculateAge(student["birthDate"]) // Use calculated age
              ) : (
                <EditableField
                  label={label}
                  value={student[field]}
                  userId={userId}
                  fieldName={field}
                  onUpdate={handleUpdate}
                />
              )}
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

      {/* Diagnosis Information */}
      <div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-blue-700 mb-5">Diagnosis Information</h2>
        {appointments
          .filter((appointment) => appointment.status === "Completed" && appointment.diagnosis)
          .map((appointment) => (
            <div key={appointment.$id} className="mb-4 border border-blue-700 rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDiagnosis(appointment.$id)}
              >
                <div className="text-black">
                  <p><strong className="text-blue-700">Date:</strong> {appointment.date}</p>
                  <p><strong className="text-blue-700">Time:</strong> {appointment.time}</p>
                </div>
                <div>
                  {expandedDiagnosisId === appointment.$id ? (
                    <ChevronUp className="h-5 w-5 text-blue-700" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-700" />
                  )}
                </div>
              </div>
              {expandedDiagnosisId === appointment.$id && (
                <div className="mt-4 text-black">
                  <p><strong className="text-blue-700">Blood Pressure:</strong> {JSON.parse(appointment.diagnosis).bloodPressure}</p>
                  <p><strong className="text-blue-700">Chief Complaint:</strong> {JSON.parse(appointment.diagnosis).chiefComplaint}</p>
                  <p><strong className="text-blue-700">Notes:</strong> {JSON.parse(appointment.diagnosis).notes}</p>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Diet Recommendation Form */}
{/* Diet Recommendation Form */}
<div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-700 relative">
  <h2 className="text-2xl font-semibold text-blue-700 mb-5">Send Wellness Notes</h2>
  <form onSubmit={handleDietRecommendationSubmit}>
    <div className="space-y-4">
      <textarea
        placeholder="Enter wellness note..."
        value={dietNote}
        onChange={(e) => setDietNote(e.target.value)}
        className="w-full p-2 bg-gray-50 text-black border border-blue-700 rounded-lg focus:outline-none"
        rows={4}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setDietImage(file);
        }}
        className="w-full p-2 bg-gray-100 text-black border border-gray-300 rounded-lg"
      />
      
      {/* Camera Capture Button */}
      <button
        type="button"
        onClick={async () => {
          try {
            if (window.activeStream) {
              window.activeStream.getTracks().forEach(track => track.stop());
              window.activeStream = undefined;
              document.querySelector('#camera-container')?.remove();
              return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            window.activeStream = stream;

            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            video.style.display = 'block';
            video.style.width = '100%';
            video.style.maxWidth = '400px';
            video.style.border = '2px solid #1e3a8a';
            video.style.borderRadius = '8px';
            video.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';

            const cameraContainer = document.createElement('div');
            cameraContainer.id = 'camera-container';
            cameraContainer.style.display = 'flex';
            cameraContainer.style.flexDirection = 'column';
            cameraContainer.style.alignItems = 'center';
            cameraContainer.style.marginTop = '16px';
            cameraContainer.style.width = '100%';

            cameraContainer.appendChild(video);
            document.querySelector('.space-y-4')?.appendChild(cameraContainer);

            // Create Capture button
            const captureButton = document.createElement('button');
            captureButton.innerText = 'Capture Photo';
            captureButton.className = 'bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg mt-2';
            cameraContainer.appendChild(captureButton);

            // Wait for user to click Capture
            await new Promise((resolve) => captureButton.onclick = resolve);

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL('image/png');
            const blob = await fetch(imageUrl).then((res) => res.blob());
            const file = new File([blob], 'captured_image.png', { type: 'image/png' });
            setDietImage(file);

            // Cleanup
            stream.getTracks().forEach((track) => track.stop());
            window.activeStream = undefined;
            cameraContainer.remove();
          } catch (error) {
            console.error('Error accessing camera:', error);
          }
        }}
        className="absolute top-0 right-0 m-3 p-2 border-2 border-white bg-white-600 hover:border-2 hover:border-blue-700 rounded-full"
      >
        <FaCamera className="text-xl text-blue-700"/>
      </button>

      {/* Image Preview Section */}
      {dietImage && (
        <div className="mt-3">
          <p className="text-sm text-gray-600">Selected Image:</p>
          <img
            src={URL.createObjectURL(dietImage)}
            alt="Selected notes"
            className="w-96 h-64 object-cover rounded-lg border border-gray-400 mt-2"
          />
        </div>
      )}

      <Button
        type="submit"
        className="bg-blue-700 hover:bg-blue-500 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Wellness Notes'}
      </Button>
    </div>
  </form>

  {/* Display message after submission */}
  {message && (
    <p className={`mt-3 text-sm ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
      {message}
    </p>
  )}
</div>


{/* Diet Recommendation History */}
<div className="bg-white border-2 border-blue-700 p-6 rounded-lg shadow-md">


  <div
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
  >
    <h2 className="text-2xl font-semibold text-blue-700">Wellness Notes History</h2>
    <div>
      {isHistoryExpanded ? (
        <ChevronUp className="h-5 w-5 text-blue-700" />
      ) : (
        <ChevronDown className="h-5 w-5 text-blue-700" />
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
            <div key={index} className="mb-4 border rounded-lg p-4 relative text-black">
              <button 
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg shadow hover:bg-red-700" 
                onClick={() => openDeleteModal(index)}
              >
                Delete
              </button>
              <p><strong className="text-blue-700">Note:</strong> {recommendation.note}</p>
              {recommendation.imageUrl && (
                <div className="mt-2">
                  <img
                    src={recommendation.imageUrl}
                    alt="Wellness Notes"
                    className="w-full max-w-md rounded-lg shadow-md"
                  />
                </div>
              )}
              <p><strong className="text-blue-700">Date:</strong> {new Date(recommendation.timestamp).toLocaleString()}</p>

    

              
            </div>
          ))
        ) : (
          <p className="text-gray-400">No Wellness Notes found.</p>
        )
      ) : (
        <p className="text-gray-400">No Wellness Notes found.</p>
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRecommendation}
      />
    </div>
  )}

   
</div>
{/* Medical Clearance expandable section */}
<div
        className="border-2 border-blue-700 p-6 rounded-lg cursor-pointer flex justify-between items-center"
        onClick={toggleExpand}
      >
        <h3 className="text-2xl text-blue-700 font-semibold">Medical Clearance</h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-blue-700" />
        ) : (
          <ChevronDown className="h-5 w-5 text-blue-700" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4">
         <MedicalClearanceForm 
  patientName={student.name} 
  patientAge={student.age} 
  patientAddress={student.address}
  patientCivilStatus={student.civilStatus}
/>


        </div>
      )}
      {/* Medical Record expandable section */}
<div
  className="border-2 border-blue-700 p-6 rounded-lg cursor-pointer flex justify-between items-center"
  onClick={toggleExpandMedicalRecord}
>
  <h3 className="text-2xl text-blue-700 font-semibold">Medical Record</h3>
  {isExpandedMedicalRecord ? (
    <ChevronUp className="h-5 w-5 text-blue-700" />
  ) : (
    <ChevronDown className="h-5 w-5 text-blue-700" />
  )}
</div>

{isExpandedMedicalRecord && (
  <div className="mt-4">
    <MedicalRecord
    patientName={student.name}
    patientAge={student.age}
    patientAddress={student.address}
    patientGender={student.gender}
    patientContactNumber={student.phone}
    office={student.college && student.college !== "None" ? student.college : student.office || ""}
  />
  </div>
)}

      <EmailForm studentEmail={student.email} />
    </div>
  );
};

export default StudentDetail;