"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import EmployeeSideBar from "@/components/EmployeeSideBar";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

interface Appointment {
  $id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

const AppointmentsPage = () => {
  const params = useParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
  
  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c"
      );
      setAppointments(response.documents as Appointment[]);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c",
        appointmentId,
        {
          status: newStatus
        }
      );
      fetchAppointments();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          "67b96b0800349392bb1c",
          appointmentId
        );
        fetchAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Failed to delete appointment");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <EmployeeSideBar userId={params.userId as string} />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-700 mb-8">Appointments Management</h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left text-blue-700">Patient Name</th>
                    <th className="p-4 text-left text-blue-700">Date</th>
                    <th className="p-4 text-left text-blue-700">Time</th>
                    <th className="p-4 text-left text-blue-700">Reason</th>
                    <th className="p-4 text-left text-blue-700">Status</th>
                    <th className="p-4 text-left text-blue-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.$id} className="border-t">
                      <td className="p-4">{appointment.patientName}</td>
                      <td className="p-4">{appointment.date}</td>
                      <td className="p-4">{appointment.time}</td>
                      <td className="p-4">{appointment.reason}</td>
                      <td className="p-4">
                        {editingId === appointment.$id ? (
                          <select
                            className="border rounded p-1"
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment.$id, e.target.value)}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => setEditingId(appointment.$id)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(appointment.$id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage; 