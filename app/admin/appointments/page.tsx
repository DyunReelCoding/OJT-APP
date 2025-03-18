"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Appointment {
  $id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  userid: string;
  diagnosis?: string;
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{id: string, patientName: string} | null>(null);
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [isDiagnosisDialogOpen, setIsDiagnosisDialogOpen] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);
  const [bpFilter, setBpFilter] = useState("");
  const [chiefComplaintFilter, setChiefComplaintFilter] = useState("");

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
      setFilteredAppointments(response.documents as Appointment[]);
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      setMessageType("error");
    }
  };

  useEffect(() => {
    const filtered = appointments.filter(appointment =>
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c",
        appointmentId,
        { status: newStatus }
      );
      fetchAppointments();
      setMessage("✅ Appointment status updated successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("❌ Error updating appointment status:", error);
      setMessageType("error");
    }
  };

  const openDeleteDialog = (appointmentId: string, patientName: string) => {
    setAppointmentToDelete({ id: appointmentId, patientName });
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c",
        appointmentToDelete.id
      );
      fetchAppointments();
      setMessage("✅ Appointment deleted successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("❌ Error deleting appointment:", error);
      setMessageType("error");
    } finally {
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
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

  const handleViewDiagnosis = (diagnosis: string) => {
    try {
      const parsedDiagnosis = JSON.parse(diagnosis);
      setSelectedDiagnosis(parsedDiagnosis);
      setIsDiagnosisDialogOpen(true);
    } catch (error) {
      console.error("Error parsing diagnosis:", error);
    }
  };

  const handleFilter = () => {
    const filtered = appointments.filter(appointment => {
      if (appointment.diagnosis) {
        const diagnosis = JSON.parse(appointment.diagnosis);
        const bpMatch = !bpFilter || diagnosis.bloodPressure === bpFilter;
        const complaintMatch = !chiefComplaintFilter || diagnosis.chiefComplaint === chiefComplaintFilter;
        return bpMatch && complaintMatch;
      }
      return false;
    });
    setFilteredAppointments(filtered);
  };

  const resetFilters = () => {
    setBpFilter(""); // Reset BP filter
    setChiefComplaintFilter(""); // Reset chief complaint filter
    setSearchTerm(""); // Reset search term
    fetchAppointments(); // Re-fetch appointments to show the full list
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-700">Manage Appointments</h1>
              <p className="text-gray-600 mt-2">View and manage all appointments</p>
            </div>
            <Button
              onClick={fetchAppointments}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>

          {message && (
            <div
              className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-auto px-4 py-3 rounded border shadow-lg text-center z-50 font-bold text-lg${messageType === "success"
                  ? " bg-green-100 border-green-400 text-green-700"
                  : " bg-red-100 border-red-400 text-red-700"
                }`}
            >
              {message}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 ml-64">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search appointments..."
                    className="pl-10 pr-4 py-2 w-full bg-white border-2 border-blue-700 text-black focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="flex gap-4 mb-6 text-black">
                <Input
                  type="text"
                  value={bpFilter}
                  onChange={(e) => setBpFilter(e.target.value)}
                  placeholder="Filter by BP (e.g., 120/80)"
                  className="w-48 text-white"
                />
                <Select onValueChange={setChiefComplaintFilter} value={chiefComplaintFilter}>
                  <SelectTrigger className="w-48 text-black">
                    <SelectValue placeholder="Filter by Chief Complaint" />
                  </SelectTrigger>
                  <SelectContent className="text-black">
                    <SelectItem value="Cough">Cough</SelectItem>
                    <SelectItem value="Stomachache">Stomachache</SelectItem>
                    <SelectItem value="Headache">Headache</SelectItem>
                    <SelectItem value="Fever">Fever</SelectItem>
                    <SelectItem value="LBM">LBM</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleFilter}>Apply Filter</Button>
                <Button onClick={resetFilters} variant="outline">Reset Filter</Button> {/* Add this button */}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.$id}>
                        <td className="px-6 py-4 text-black whitespace-nowrap">{appointment.patientName}</td>
                        <td className="px-6 py-4 text-black whitespace-nowrap">{appointment.date}</td>
                        <td className="px-6 py-4 text-black whitespace-nowrap">{appointment.time}</td>
                        <td className="px-6 py-4 text-black whitespace-nowrap">{appointment.reason}</td>
                        <td className="px-6 py-4 text-black whitespace-nowrap">
                          <select
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment.$id, e.target.value)}
                            className={`rounded-full px-3 py-1 text-sm ${getStatusColor(appointment.status)}`}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-black whitespace-nowrap">
                          {appointment.diagnosis && (
                            <Button
                              onClick={() => handleViewDiagnosis(appointment.diagnosis!)}
                              variant="outline"
                              size="sm"
                            >
                              View Details
                            </Button>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-red-700">
                          <Button
                            onClick={() => openDeleteDialog(appointment.$id, appointment.patientName)}
                            variant="destructive"
                            size="sm"
                            className=" hover:bg-red-700 hover:text-white px-5"
                          >
                            Delete
                          </Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className=" text-red-700">Delete Appointment for <strong className="text-black">{appointmentToDelete?.patientName}</strong>?</DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete <strong className="text-black">{appointmentToDelete?.patientName}'s</strong> appointment? This action cannot be undone.
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

      {/* Diagnosis Details Dialog */}
      <Dialog open={isDiagnosisDialogOpen} onOpenChange={setIsDiagnosisDialogOpen}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-blue-700">Diagnosis Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDiagnosis && (
              <>
                <div>
                  <p className="text-sm"><strong>Blood Pressure:</strong> {selectedDiagnosis.bloodPressure || 'N/A'}</p>
                  <p className="text-sm"><strong>Chief Complaint:</strong> {selectedDiagnosis.chiefComplaint || 'N/A'}</p>
                  <p className="text-sm"><strong>Notes:</strong> {selectedDiagnosis.notes || 'N/A'}</p>
                </div>
                {selectedDiagnosis.medicines && (
                  <div>
                    <p className="text-sm font-semibold">Prescribed Medicines:</p>
                    <ul className="text-sm list-disc pl-5">
                      {selectedDiagnosis.medicines.map((med: any, index: number) => (
                        <li key={index}>
                          {med.name} - {med.quantity} unit(s)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDiagnosisDialogOpen(false)}
              className="border-blue-700 hover:bg-white hover:text-blue-700 bg-blue-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;