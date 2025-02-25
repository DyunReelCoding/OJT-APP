"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import { useParams } from "next/navigation";
import StudentSideBar from "@/components/StudentSideBar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Appointment {
  $id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  userid: string;
}

const StudentAppointmentsPage = () => {
  const params = useParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
      const userAppointments = response.documents.filter(
        (doc: any) => doc.userid === params.userId
      );
      setAppointments(userAppointments);
      setFilteredAppointments(userAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    const filtered = appointments.filter(appointment =>
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.date.includes(searchTerm)
    );
    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSideBar userId={params.userId as string} />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-700">My Appointments</h1>
            <p className="text-gray-600 mt-2">View all your appointments and their status</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search appointments..."
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.$id}>
                        <td className="px-6 py-4 text-black whitespace-nowrap">{appointment.date}</td>
                        <td className="px-6 py-4  text-black whitespace-nowrap">{appointment.time}</td>
                        <td className="px-6 py-4  text-black whitespace-nowrap">{appointment.reason}</td>
                        <td className="px-6 py-4  text-black whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
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
    </div>
  );
};

export default StudentAppointmentsPage; 