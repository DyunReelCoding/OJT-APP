"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import SideBar from "@/components/SideBar";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
}

interface Medicine {
  $id: string;
  name: string;
  brand: string;
  category: string;
  stock: string;
  location: string;
  expiryDate: string;
}

const MEDICINES_COLLECTION_ID = "67b486f5000ff28439c6";

const CalendarPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'day'>('month');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [bloodPressure, setBloodPressure] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  
  // New state for medicine prescriptions
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<{id: string, name: string, quantity: number}[]>([]);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionAppointmentId, setPrescriptionAppointmentId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Add these state variables with your other useState declarations
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
  
  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
    fetchMedicines();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c"
      );
      setAppointments(response.documents as unknown as Appointment[]);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        MEDICINES_COLLECTION_ID
      );
      setMedicines(response.documents as unknown as Medicine[]);
      setFilteredMedicines(response.documents as unknown as Medicine[]);
    } catch (error) {
      console.error("Error fetching medicines:", error);
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
    if (newStatus === "Cancelled" || newStatus === "Completed") {
      setSelectedAppointmentId(appointmentId);
      setSelectedStatus(newStatus);
      setIsModalOpen(true);
    } else {
      try {
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          "67b96b0800349392bb1c",
          appointmentId,
          { status: newStatus }
        );
        fetchAppointments();
      } catch (error) {
        console.error("Error updating appointment status:", error);
        alert("Failed to update appointment status");
      }
    }
  };

  const handleModalSubmit = async () => {
    if (!selectedAppointmentId || !selectedStatus) return;
  
    try {
      const updateData: any = { status: selectedStatus };
      if (selectedStatus === "Cancelled") {
        updateData.cancellationReason = cancellationReason;
      } else if (selectedStatus === "Completed") {
        // Truncate the notes field to ensure the JSON string does not exceed 255 characters
        const truncatedNotes = notes.length > 500 ? notes.substring(0, 500) + "..." : notes;
        const diagnosisData = JSON.stringify({
          bloodPressure,
          chiefComplaint,
          notes: truncatedNotes,
        });
  
        // Ensure the JSON string does not exceed 255 characters
        if (diagnosisData.length > 1000) {
          throw new Error("Diagnosis data exceeds the maximum length of 255 characters.");
        }
  
        updateData.diagnosis = diagnosisData;
      }
  
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c", // Use the correct collection ID
        selectedAppointmentId,
        updateData
      );
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment. Diagnosis data may be too long.");
    } finally {
      setIsModalOpen(false);
      setSelectedAppointmentId(null);
      setSelectedStatus(null);
      setBloodPressure("");
      setChiefComplaint("");
      setNotes("");
      setCancellationReason("");
    }
  };

  // Replace the handleDelete function with these two functions
  const openDeleteDialog = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c",
        appointmentToDelete
      );
      fetchAppointments();
      setMessage("✅ Appointment deleted successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      setMessage("Failed to delete appointment. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  // New function to handle medicine search
  const handleMedicineSearch = (term: string) => {
    setMedicineSearchTerm(term);
    if (!term.trim()) {
      setFilteredMedicines(medicines);
      return;
    }
    
    const filtered = medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(term.toLowerCase()) ||
      medicine.brand.toLowerCase().includes(term.toLowerCase()) ||
      medicine.category.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredMedicines(filtered);
  };

  // New function to add medicine to prescription
  const addMedicineToPrescription = (medicineId: string, medicineName: string) => {
    // Check if medicine is already in the list
    if (selectedMedicines.some(med => med.id === medicineId)) {
      return;
    }
    
    setSelectedMedicines([...selectedMedicines, { id: medicineId, name: medicineName, quantity: 1 }]);
  };

  // New function to remove medicine from prescription
  const removeMedicineFromPrescription = (medicineId: string) => {
    setSelectedMedicines(selectedMedicines.filter(med => med.id !== medicineId));
  };

  // New function to update medicine quantity
  const updateMedicineQuantity = (medicineId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedMedicines(selectedMedicines.map(med => 
      med.id === medicineId ? { ...med, quantity } : med
    ));
  };

  // New function to open prescription modal
  const openPrescriptionModal = (appointmentId: string) => {
    setPrescriptionAppointmentId(appointmentId);
    setSelectedMedicines([]);
    setIsPrescriptionModalOpen(true);
  };

  // New function to handle prescription submission
  const handlePrescriptionSubmit = async () => {
    if (!prescriptionAppointmentId || selectedMedicines.length === 0) return;
    
    try {
      // Get the current appointment to check if it already has diagnosis
      const appointment = appointments.find(app => app.$id === prescriptionAppointmentId);
      
      // Create prescription data
      const prescriptionData = {
        medicines: selectedMedicines
      };
      
      // If there's existing diagnosis data, merge it with the prescription data
      let diagnosisData: any = prescriptionData;
      
      if (appointment?.diagnosis) {
        try {
          const existingDiagnosis = JSON.parse(appointment.diagnosis);
          diagnosisData = {
            ...existingDiagnosis,
            medicines: selectedMedicines
          };
        } catch (e) {
          console.error("Error parsing existing diagnosis:", e);
        }
      }
      
      // Update the appointment with prescription data in the diagnosis field
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c",
        prescriptionAppointmentId,
        { diagnosis: JSON.stringify(diagnosisData) }
      );
      
      // Update medicine stock
      for (const medicine of selectedMedicines) {
        const medicineDoc = medicines.find(med => med.$id === medicine.id);
        if (medicineDoc) {
          // Convert stock to number, subtract quantity, and convert back to string
          const currentStock = parseInt(medicineDoc.stock);
          const newStock = Math.max(0, currentStock - medicine.quantity).toString();
          
          await databases.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            MEDICINES_COLLECTION_ID,
            medicine.id,
            { stock: newStock }
          );
        }
      }
      
      // Show success message
      setMessage("✅ Medicines prescribed successfully and inventory updated!");
      setMessageType("success");
      setTimeout(() => setMessage(null), 3000);
      
      // Refresh data
      fetchAppointments();
      fetchMedicines();
      
      // Close modal
      setIsPrescriptionModalOpen(false);
      setPrescriptionAppointmentId(null);
    } catch (error) {
      console.error("Error prescribing medicines:", error);
      setMessage("Failed to prescribe medicines. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
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
          <Button variant="outline" onClick={() => setView('month')} className="text-white bg-blue-700">
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
                {appointment.status === "Cancelled" && appointment.cancellationReason && (
                  <p className="text-sm text-gray-500 mt-1">Reason: {appointment.cancellationReason}</p>
                )}
                {appointment.status === "Completed" && appointment.diagnosis && (
                  <div className="mt-2">
                    <p className="text-sm"><strong>Blood Pressure:</strong> {JSON.parse(appointment.diagnosis).bloodPressure || 'N/A'}</p>
                    <p className="text-sm"><strong>Chief Complaint:</strong> {JSON.parse(appointment.diagnosis).chiefComplaint || 'N/A'}</p>
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
              
              <div className="flex flex-col gap-2">
                <select
                  className="border border-blue-700 rounded p-1 mr-2 bg-white focus:outline-none"
                  value={appointment.status}
                  onChange={(e) => handleStatusChange(appointment.$id, e.target.value)}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {appointment.status === "Completed" && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-white border-blue-700 bg-blue-700 hover:bg-white hover:text-blue-700"
                    onClick={() => openPrescriptionModal(appointment.$id)}
                  >
                    {appointment.diagnosis && JSON.parse(appointment.diagnosis).medicines ? "Update Prescription" : "Add Prescription"}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-700"
                  onClick={() => openDeleteDialog(appointment.$id)}
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

  const filteredAppointments = appointments.filter(appointment => 
    statusFilter === "all" ? true : appointment.status === statusFilter
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-700">Appointment Calendar</h1>
            <div className="flex items-center gap-4">
              <select
                className="border rounded-lg px-3 py-2 bg-white text-black"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <Button variant="outline" className="flex items-center gap-2 text-black bg-white">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-auto px-4 py-3 rounded border shadow-lg text-center z-50 font-bold text-lg${
              messageType === "success" ? " bg-green-100 text-green-800" : " bg-red-100 text-red-800"
            }`}>
              {message}
            </div>
          )}

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
                    const dayAppointments = filteredAppointments.filter(appointment => {
                      const appointmentDate = new Date(appointment.date);
                      return appointmentDate.toDateString() === date.toDateString();
                    });
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedDate(date);
                          setView('day');
                        }}
                        className={`bg-white p-3 h-32 hover:bg-gray-50 cursor-pointer border-t ${
                          isToday ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className={`font-medium ${
                          isToday ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="mt-2 space-y-1">
                          {dayAppointments.slice(0, 2).map(appointment => (
                            <div
                              key={appointment.$id}
                              className={`text-xs p-1.5 rounded-md ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.time} - {appointment.patientName}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs font-medium text-gray-500 pl-1">
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

      {/* Diagnosis/Cancellation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-blue-700">
              {selectedStatus === "Cancelled" ? "Cancel Appointment" : "Complete Appointment"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStatus === "Cancelled" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Reason for Cancellation</label>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation"
                  required
                  className="bg-gray-50 border-blue-700"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Pressure</label>
                <Input
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="e.g. 120/80"
                  required
                  className="bg-white border border-blue-700 text-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chief Complaint</label>
                <Input
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Primary reason for visit"
                  required
                  className="bg-white border border-blue-700 text-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Diagnosis notes and recommendations"
                  required
                  className="bg-white border border-blue-700 text-black"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button className="bg-red-700 text-white hover:bg-white hover:text-red-700 border-red-700" type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-700 text-white hover:bg-white hover:text-blue-700 border border-blue-700" type="button" onClick={handleModalSubmit}>
              {selectedStatus === "Cancelled" ? "Confirm Cancellation" : "Complete Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Modal */}
      <Dialog open={isPrescriptionModalOpen} onOpenChange={setIsPrescriptionModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Prescribe Medicines</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Medicine Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700" />
              <Input
                value={medicineSearchTerm}
                onChange={(e) => handleMedicineSearch(e.target.value)}
                placeholder="Search medicines..."
                className="pl-10 bg-white border-2 border-blue-700"
              />
            </div>
            
            {/* Medicine List */}
            <div className="border rounded-md h-48 overflow-y-auto">
              {filteredMedicines.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No medicines found</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">Brand</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map(medicine => (
                      <tr key={medicine.$id} className="border-t">
                        <td className="px-4 py-2 text-sm">{medicine.name}</td>
                        <td className="px-4 py-2 text-sm">{medicine.brand}</td>
                        <td className="px-4 py-2 text-sm">{medicine.stock}</td>
                        <td className="px-4 py-2 text-sm">
                          <Button 
                            size="sm" 
                            className="bg-blue-700 text-white hover:bg-white hover:text-blue-700 border-blue-700"
                            variant="outline"
                            onClick={() => addMedicineToPrescription(medicine.$id, medicine.name)}
                            disabled={selectedMedicines.some(med => med.id === medicine.$id) || parseInt(medicine.stock) <= 0}
                          >
                            Add
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Selected Medicines */}
            <div>
              <h3 className="text-sm font-medium mb-2 text-blue-700">Selected Medicines</h3>
              {selectedMedicines.length === 0 ? (
                <div className="text-sm text-gray-500">No medicines selected</div>
              ) : (
                <div className="space-y-2">
                  {selectedMedicines.map(medicine => (
                    <div key={medicine.id} className="flex items-center justify-between border border-blue-700 rounded-md p-2">
                      <span className="text-sm">{medicine.name}</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 w-7 p-0"
                          onClick={() => updateMedicineQuantity(medicine.id, medicine.quantity - 1)}
                          disabled={medicine.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="text-sm w-6 text-center">{medicine.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 w-7 p-0"
                          onClick={() => updateMedicineQuantity(medicine.id, medicine.quantity + 1)}
                          disabled={medicine.quantity >= parseInt(medicines.find(med => med.$id === medicine.id)?.stock || "0")}
                        >
                          +
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 h-7 w-7 p-0 ml-2"
                          onClick={() => removeMedicineFromPrescription(medicine.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button className="bg-red-700 text-white hover:bg-white hover:text-red-700 border border-red-700" type="button" variant="outline" onClick={() => setIsPrescriptionModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-blue-700 text-white hover:bg-white hover:text-blue-700 border border-blue-700"
              onClick={handlePrescriptionSubmit}
              disabled={selectedMedicines.length === 0}
            >
              Prescribe Medicines
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete Appointment</DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-blue-700 hover:bg-white hover:text-blue-700 bg-blue-700 text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="border border-red-700 hover:bg-white hover:text-red-700 bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;