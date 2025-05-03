"use client";

import { useEffect, useState } from "react";
import { Client, Databases, ID, Query } from "appwrite";
import { useParams } from "next/navigation";
import EmployeeSideBar from "@/components/EmployeeSideBar";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Appointment {
  $id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  userid: string;
  cancellationReason?: string;
  diagnosis?: string;
  prescriptions?: string;
  office: string;
  occupation: string;
}

interface Employee {
  $id: string;
  name: string;
  email: string;
  occupation: string;
  office: string;
}

interface UnavailableSlot {
  $id: string;
  date: string;
  timeRange: string;
  reason?: string;
  capacity?: number;
  booked?: number;
}

const EmployeeCalendarPage = () => {
  const params = useParams();
  const userId = params.userId as string;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'day'>('month');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);

  // Appointment scheduling states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingDate, setSchedulingDate] = useState<Date | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    time: "",
    reason: "",
    status: "Scheduled" as const,
    office: "",
    occupation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

  const databases = new Databases(client);

  useEffect(() => {
    fetchEmployeeData();
    fetchAppointments();
    fetchUnavailableSlots();
  }, [currentDate]);

  const fetchUnavailableSlots = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_UNAVAILABLESLOTS_COLLECTION_ID!
      );
      setUnavailableSlots(response.documents as unknown as UnavailableSlot[]);
    } catch (error) {
      console.error("Error fetching unavailable slots:", error);
    }
  };
  
  const fetchEmployeeData = async () => {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
        userId
      );
      setEmployee(response as unknown as Employee);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!
      );
      const userAppointments = response.documents.filter(
        (doc: any) => doc.userid === userId
      ) as unknown as Appointment[];
      setAppointments(userAppointments);
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

  const isSlotUnavailable = (date: Date, time: string) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Convert time to minutes since midnight for easier comparison
    const timeToMinutes = (timeStr: string) => {
      const [timePart, period] = timeStr.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);
      let total = hours * 60 + minutes;
      if (period === 'PM' && hours < 12) total += 12 * 60;
      if (period === 'AM' && hours === 12) total -= 12 * 60;
      return total;
    };
  
    const selectedTime = timeToMinutes(time);
    
    return unavailableSlots.some((slot) => {
      if (slot.date !== formattedDate) return false;
      
      const [startTimeStr] = slot.timeRange.split(' - ');
      const startTime = timeToMinutes(startTimeStr);
      
      // If slot has no capacity (completely unavailable)
      if (typeof slot.capacity === 'undefined') {
        return selectedTime === startTime;
      }
      
      // If slot has capacity but is full
      return selectedTime === startTime && (slot.booked || 0) >= slot.capacity;
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minutes
  
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push(timeString);
      }
    }
  
    return slots;
  };

  const handleScheduleClick = (date: Date) => {
    setSchedulingDate(date);
    setShowScheduleModal(true);
    setNewAppointment({
      patientName: employee?.name || "",
      time: "",
      reason: "",
      status: "Scheduled",
      office: employee?.office || "",
      occupation: employee?.occupation || "",
    });
    setSubmitSuccess(false);
    setSubmitError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!schedulingDate) return;
  
    // Check if the selected time slot is unavailable
    if (isSlotUnavailable(schedulingDate, newAppointment.time)) {
      setSubmitError("This time slot is unavailable or at full capacity. Please choose another time.");
      return;
    }
  
    setIsSubmitting(true);
    setSubmitError("");
  
    try {
      // Format the date as YYYY-MM-DD
      const formattedDate = format(schedulingDate, 'yyyy-MM-dd');
  
      // Create the appointment in the database
      await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
        ID.unique(),
        {
          patientName: newAppointment.patientName,
          date: formattedDate,
          time: newAppointment.time,
          reason: newAppointment.reason,
          status: newAppointment.status,
          userid: userId,
          office: newAppointment.office,
          occupation: newAppointment.occupation,
        }
      );
  
      // Find the matching slot to update booked count
      const matchingSlot = unavailableSlots.find(slot => {
        if (slot.date !== formattedDate) return false;
        const [startTimeStr] = slot.timeRange.split(' - ');
        return newAppointment.time === startTimeStr;
      });
  
      // If slot exists with capacity, increment booked count
      if (matchingSlot && matchingSlot.capacity) {
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_UNAVAILABLESLOTS_COLLECTION_ID!,
          matchingSlot.$id,
          {
            booked: (matchingSlot.booked || 0) + 1
          }
        );
      }
      
      setSubmitSuccess(true);
      fetchAppointments();
      fetchUnavailableSlots();
  
      setTimeout(() => {
        setShowScheduleModal(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error creating appointment:", error);
      setSubmitError("Failed to create appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDayView = () => {
    if (!selectedDate) return null;

    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === selectedDate.toDateString();
    });

    const unavailableSlotsForDay = unavailableSlots.filter(
      slot => slot.date === format(selectedDate, 'yyyy-MM-dd')
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <div className="flex gap-3">
            <Button 
              onClick={() => handleScheduleClick(selectedDate)} 
              className="bg-blue-700 hover:bg-blue-600 text-white"
            >
              Schedule Appointment
            </Button>
            <Button variant="outline" onClick={() => setView('month')} className="text-black bg-white">
              Back to Month View
            </Button>
          </div>
        </div>

        {dayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No appointments scheduled for this day
          </div>
        ) : (
          <div className="space-y-4">
            {dayAppointments.map(appointment => (
              <div
                key={appointment.$id}
                className={`p-4 rounded-lg ${getStatusColor(appointment.status)}`}
              >
                <div>
                  <h3 className="font-semibold">{appointment.patientName}</h3>
                  <p className="text-sm">Time: {appointment.time}</p>
                  <p className="text-sm mt-1">Reason: {appointment.reason}</p>
                  <p className="text-sm">Status: {appointment.status}</p>
                  
                  {appointment.status === "Cancelled" && appointment.cancellationReason && (
                    <p className="text-sm text-gray-500 mt-1">Reason: {appointment.cancellationReason}</p>
                  )}
                  
                  {appointment.status === "Completed" && appointment.diagnosis && (
                    <div className="mt-2">
                      <p className="text-sm"><strong>Blood Pressure:</strong> {JSON.parse(appointment.diagnosis).bloodPressure || 'N/A'}</p>
                      <p className="text-sm"><strong>Chief Complaint:</strong> {JSON.parse(appointment.diagnosis).chiefComplaint || 'N/A'}</p>
                      <p className="text-sm"><strong>Dental Type:</strong> {JSON.parse(appointment.diagnosis).dental || 'N/A'}</p>
                      <p className="text-sm"><strong>Notes:</strong> {JSON.parse(appointment.diagnosis).notes || 'N/A'}</p>
                      
                      {JSON.parse(appointment.diagnosis).medicines && (
                        <div className="mt-2 border-t pt-2">
                          <p className="text-sm font-semibold">Prescribed Medicines:</p>
                          <ul className="text-sm list-disc pl-5">
                            {JSON.parse(appointment.diagnosis).medicines.map((med: any, index: number) => (
                              <li key={index}>
                                {med.name} - {med.quantity} unit(s)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {unavailableSlotsForDay.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Time Slot Availability</h3>
            <div className="space-y-2">
              {unavailableSlotsForDay.map(slot => (
                <div
                  key={slot.$id}
                  className="p-4 rounded-lg bg-gray-100"
                >
                  <p className="text-sm font-medium text-black">{slot.timeRange}</p>
                  {slot.capacity ? (
                    <p className="text-sm text-black">
                      Available slots: {slot.capacity - (slot.booked || 0)}/{slot.capacity}
                      {slot.reason && ` - ${slot.reason}`}
                    </p>
                  ) : (
                    <p className="text-sm text-black">
                      Unavailable - {slot.reason || "No reason provided"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderScheduleModal = () => {
    if (!showScheduleModal || !schedulingDate) return null;
  
    const unavailableSlotsForDay = unavailableSlots.filter(
      slot => slot.date === format(schedulingDate, 'yyyy-MM-dd')
    );
  
    const timeSlots = generateTimeSlots();
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold text-gray-800">
              Schedule Appointment for {format(schedulingDate, 'MMMM d, yyyy')}
            </h2>
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
  
          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 flex-1">
            <form onSubmit={handleSubmitAppointment} className="space-y-4">
              <div className="space-y-2 text-black">
                <Label className="text-blue-700" htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  name="patientName"
                  value={newAppointment.patientName}
                  onChange={handleInputChange}
                  placeholder="Enter patient name"
                  required
                  readOnly
                  className="bg-gray-50 border-blue-700"
                />
                <p className="text-xs text-gray-500">Name is automatically filled based on your account</p>
              </div>
  
              <div className="space-y-2 text-black">
                <Label className="text-blue-700" htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={newAppointment.occupation}
                  onChange={handleInputChange}
                  placeholder="Enter occupation"
                  required
                  readOnly
                  className="bg-gray-50 border-blue-700"
                />
                <p className="text-xs text-gray-500">Occupation is automatically filled based on your account</p>
              </div>
  
              {newAppointment.occupation === "Employee" && (
                <div className="space-y-2 text-black">
                  <Label className="text-blue-700" htmlFor="office">Office</Label>
                  <Input
                    id="office"
                    name="office"
                    value={newAppointment.office}
                    onChange={handleInputChange}
                    placeholder="Enter office"
                    required
                    readOnly
                    className="bg-gray-50 border-blue-700"
                  />
                  <p className="text-xs text-gray-500">Office is automatically filled based on your account</p>
                </div>
              )}
  
              {unavailableSlotsForDay.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-blue-700">Time Slot Availability</Label>
                  <div className="bg-gray-100 p-3 rounded-md max-h-40 overflow-y-auto">
                    {unavailableSlotsForDay.map(slot => (
                      <div key={slot.$id} className="text-sm text-gray-600 mb-2 last:mb-0">
                        {slot.timeRange} - {slot.capacity ? 
                          `${slot.capacity - (slot.booked || 0)} slots available` : 
                          "Unavailable"} - {slot.reason || "No reason provided"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              <div className="space-y-2">
                <Label className="text-blue-700" htmlFor="time">Time</Label>
                <Select
                  name="time"
                  value={newAppointment.time}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, time: value }))}
                  required
                >
                  <SelectTrigger className="bg-gray-50 text-black border-blue-700">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-blue-700 text-black max-h-60 overflow-y-auto">
                    {timeSlots.map((time, index) => {
                      const isUnavailable = isSlotUnavailable(schedulingDate, time);
                      const matchingSlot = unavailableSlotsForDay.find(slot => {
                        const [startTimeStr] = slot.timeRange.split(' - ');
                        return time === startTimeStr;
                      });
                      
                      let availabilityText = "";
                      if (matchingSlot) {
                        if (matchingSlot.capacity) {
                          availabilityText = ` (${matchingSlot.capacity - (matchingSlot.booked || 0)} available)`;
                        } else {
                          availabilityText = " (Unavailable)";
                        }
                      }
  
                      return (
                        <SelectItem
                          key={index}
                          value={time}
                          disabled={isUnavailable}
                          className="hover:bg-gray-100"
                        >
                          {time}{availabilityText}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
  
              <div className="space-y-2">
                <Label className="text-blue-700" htmlFor="reason">Reason for Appointment</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={newAppointment.reason}
                  onChange={handleInputChange}
                  placeholder="Describe the reason for this appointment"
                  required
                  rows={4}
                  className="bg-gray-50 text-black border-blue-700 min-h-[100px]"
                />
              </div>
  
              {submitError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                  {submitError}
                </div>
              )}
  
              {submitSuccess && (
                <div className="p-3 bg-green-100 text-green-700 rounded-md">
                  Appointment scheduled successfully!
                </div>
              )}
            </form>
          </div>
  
          {/* Sticky Footer */}
          <div className="p-6 border-t sticky bottom-0 bg-white">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
                className="mr-2 hover:text-white text-blue-700 hover:bg-blue-700 border-blue-700"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white"
                disabled={isSubmitting}
                onClick={handleSubmitAppointment}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <EmployeeSideBar userId={userId} />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-700">My Calendar</h1>
            <p className="text-gray-600 mt-2">View and schedule your appointments</p>
            {employee && <p className="text-gray-600">Welcome, {employee.name}</p>}
          </div>

          {/* Calendar Container */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {view === 'month' ? (
              <div className="p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={previousMonth} 
                      className="text-black bg-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentDate(new Date())} 
                      className="text-black bg-white"
                    >
                      Today
                    </Button>

                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={nextMonth} 
                      className="text-black bg-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-50 p-3 text-center text-sm font-semibold text-gray-600">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white p-3 h-32" />
                  ))}
                  
                  {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                    const dayAppointments = appointments.filter(appointment => {
                      const appointmentDate = new Date(appointment.date);
                      return appointmentDate.toDateString() === date.toDateString();
                    });
                    const isToday = date.toDateString() === new Date().toDateString();

                    const unavailableSlotsForDay = unavailableSlots.filter(
                      slot => slot.date === format(date, 'yyyy-MM-dd')
                    );

                    return (
                      <div
                        key={i}
                        className={`bg-white p-3 h-32 hover:bg-gray-50 cursor-pointer border-t ${
                          isToday ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div 
                          className={`font-medium ${
                            isToday ? 'text-blue-600' : 'text-gray-700'
                          }`}
                          onClick={() => {
                            setSelectedDate(date);
                            setView('day');
                          }}
                        >
                          {i + 1}
                        </div>
                        <div className="mt-2 space-y-1">
                          {dayAppointments.slice(0, 2).map(appointment => (
                            <div
                              key={appointment.$id}
                              className={`text-xs p-1.5 rounded-md ${getStatusColor(appointment.status)}`}
                              onClick={() => {
                                setSelectedDate(date);
                                setView('day');
                              }}
                            >
                              {appointment.time} - {appointment.patientName}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div 
                              className="text-xs font-medium text-gray-500 pl-1"
                              onClick={() => {
                                setSelectedDate(date);
                                setView('day');
                              }}
                            >
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                          <div 
                            className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer"
                            onClick={() => handleScheduleClick(date)}
                          >
                            + Add appointment
                          </div>
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
      
      {renderScheduleModal()}
    </div>
  );
};

export default EmployeeCalendarPage;