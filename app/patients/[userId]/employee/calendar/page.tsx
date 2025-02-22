"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import { useParams } from "next/navigation";
import EmployeeSideBar from "@/components/EmployeeSideBar";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Appointment {
  $id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  userid: string;
}

const CalendarPage = () => {
  const params = useParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'day'>('month');

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
  
  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

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

  const renderDayView = () => {
    if (!selectedDate) return null;

    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === selectedDate.toDateString();
    });

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <Button variant="outline" onClick={() => setView('month')}>
            Back to Month View
          </Button>
        </div>

        <div className="space-y-4">
          {dayAppointments.map(appointment => (
            <div
              key={appointment.$id}
              className={`p-4 rounded-lg ${getStatusColor(appointment.status)} flex justify-between items-center`}
            >
              <div>
                <h3 className="font-semibold">{appointment.patientName}</h3>
                <p className="text-sm">Time: {appointment.time}</p>
                <p className="text-sm mt-1">Reason: {appointment.reason}</p>
                <p className="text-sm">Status: {appointment.status}</p>
              </div>
              <div className="flex gap-2">
                <select
                  className="border rounded p-1 mr-2"
                  value={appointment.status}
                  onChange={(e) => handleStatusChange(appointment.$id, e.target.value)}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-500"
                  onClick={() => handleDelete(appointment.$id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <EmployeeSideBar userId={params.userId as string} />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {view === 'month' ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-gray-500 pb-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-32" />
                ))}
                {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                  const dayAppointments = appointments.filter(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    return appointmentDate.toDateString() === date.toDateString();
                  });

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedDate(date);
                        setView('day');
                      }}
                      className="h-32 border rounded-lg p-2 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="font-medium mb-1">{i + 1}</div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map(appointment => (
                          <div
                            key={appointment.$id}
                            className={`text-xs p-1 rounded ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.patientName} - {appointment.time}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            renderDayView()
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;