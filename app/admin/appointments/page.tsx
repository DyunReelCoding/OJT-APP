"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import SideBar from "@/components/SideBar";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Appointment {
  $id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Initialize Appwrite Client
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
        process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!
      );
      setAppointments(response.documents as Appointment[]);
    } catch (error) {
      console.error("Error fetching appointments:", error);
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
    <div className="flex h-screen">
      <SideBar />
      <div className="flex-1 p-6">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <h1 className="header">Appointments</h1>
            <p className="text-dark-700">Manage patient appointments</p>
          </section>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse shad-table">
              <thead>
                <tr className="shad-table-row-header">
                  <th className="p-4 text-left">Patient Name</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Time</th>
                  <th className="p-4 text-left">Reason</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.$id} className="shad-table-row">
                    <td className="p-4">{appointment.patientName}</td>
                    <td className="p-4">{appointment.date}</td>
                    <td className="p-4">{appointment.time}</td>
                    <td className="p-4">{appointment.reason}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash className="text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppointmentsPage; 