"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import ReactSelect from "react-select";
import MedicalServicesAnnualReport from "@/components/MedicalServicesAnnualReport";

interface Appointment {
  $id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  userid: string;
  diagnosis?: string;
  college: string;
  office: string;
  occupation: string;
}

interface Patient {
  $id: string;
  name: string;
  occupation: string;
  college: string;
  office: string;
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{ id: string; patientName: string } | null>(null);
  const [messageType, setMessageType] = useState("");
  const [isDiagnosisDialogOpen, setIsDiagnosisDialogOpen] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);
  const [bpFilter, setBpFilter] = useState("");
  const [chiefComplaintFilter, setChiefComplaintFilter] = useState("");
  const [occupationFilter, setOccupationFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
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

  const fetchPatients = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!
      );
      setPatients(response.documents as Patient[]);
    } catch (error) {
      console.error("❌ Error fetching patients:", error);
    }
  };

  const handleFilter = () => {
    setIsFiltering(true);
  
    const filtered = appointments.filter((appointment) => {
      const occupationMatch = !occupationFilter || appointment.occupation === occupationFilter;
      const collegeMatch = !collegeFilter || appointment.college === collegeFilter;
      const officeMatch = !officeFilter || appointment.office === officeFilter;
      
      // Chief complaint filter
      let chiefComplaintMatch = true;
      if (chiefComplaintFilter) {
        if (!appointment.diagnosis) {
          chiefComplaintMatch = false;
        } else {
          try {
            const diagnosisData = JSON.parse(appointment.diagnosis);
            
            // Debugging
            console.log("Diagnosis data:", diagnosisData);
            
            if (!diagnosisData.chiefComplaint) {
              chiefComplaintMatch = false;
            } else if (Array.isArray(diagnosisData.chiefComplaint)) {
              chiefComplaintMatch = diagnosisData.chiefComplaint.some(cc => 
                cc.toLowerCase().includes(chiefComplaintFilter.toLowerCase())
              );
            } else {
              chiefComplaintMatch = diagnosisData.chiefComplaint.toLowerCase()
                .includes(chiefComplaintFilter.toLowerCase());
            }
          } catch (error) {
            console.error("Error parsing diagnosis:", error);
            chiefComplaintMatch = false;
          }
        }
      }
  
      return occupationMatch && collegeMatch && officeMatch && chiefComplaintMatch;
    });
  
    setFilteredAppointments(filtered);
    setIsFiltering(false);
  };
  

  const resetFilters = () => {
    setBpFilter("");
    setChiefComplaintFilter("");
    setSearchTerm("");
    setOccupationFilter("");
    setCollegeFilter("");
    setOfficeFilter("");
    fetchAppointments();
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

  const openDeleteDialog = (appointmentId: string, patientName: string) => {
    setAppointmentToDelete({ id: appointmentId, patientName });
    setIsDeleteDialogOpen(true);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    if (newStatus === "Cancelled" || newStatus === "Completed") {
      setSelectedAppointmentId(appointmentId);
      setSelectedStatus(newStatus);
      setIsStatusDialogOpen(true);
    } else {
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
    }
  };

  const handleStatusDialogSubmit = async () => {
    if (!selectedAppointmentId || !selectedStatus) return;

    try {
      const updateData: any = { status: selectedStatus };
      if (selectedStatus === "Cancelled") {
        updateData.cancellationReason = cancellationReason;
      } else if (selectedStatus === "Completed") {
        const diagnosisData = JSON.stringify({
          bloodPressure,
          chiefComplaint: selectedChiefComplaints.map(cc => cc.value),
          notes
        });

        updateData.diagnosis = diagnosisData;
      }

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c",
        selectedAppointmentId,
        updateData
      );

      fetchAppointments();
      setMessage("✅ Appointment status updated successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("❌ Error updating appointment:", error);
      setMessage("Failed to update appointment status");
      setMessageType("error");
    } finally {
      setIsStatusDialogOpen(false);
      setSelectedAppointmentId(null);
      setSelectedStatus(null);
      setBloodPressure("");
      setChiefComplaint("");
      setNotes("");
      setCancellationReason("");
      setSelectedChiefComplaints([]);
    }
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

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-700">Manage Appointments</h1>
              <p className="text-gray-600 mt-2">View and manage all appointments</p>
            </div>
            <Button onClick={fetchAppointments} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>

          {message && (
            <div
              className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-auto px-4 py-3 rounded border shadow-lg text-center z-50 font-bold text-lg${
                messageType === "success"
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
                {/* Occupation Filter */}
<Select onValueChange={setOccupationFilter} value={occupationFilter}>
  <SelectTrigger className="w-48 text-black">
    <SelectValue placeholder="Filter by Occupation" />
  </SelectTrigger>
  <SelectContent className="text-black">
    <SelectItem value="Student">Student</SelectItem>
    <SelectItem value="Employee">Employee</SelectItem>
  </SelectContent>
</Select>

{/* Student → College Filter */}
{occupationFilter === "Student" && (
  <Select onValueChange={setCollegeFilter} value={collegeFilter}>
    <SelectTrigger className="w-48 text-black">
      <SelectValue placeholder="Filter by College" />
    </SelectTrigger>
    <SelectContent className="text-black">
      <SelectItem value="All">All Colleges</SelectItem>
      <SelectItem value="CCIS">CCIS</SelectItem>
      <SelectItem value="CHASS">CHASS</SelectItem>
      <SelectItem value="CEGS">CEGS</SelectItem>
    </SelectContent>
  </Select>
)}

{/* Employee → Office Filter */}
{occupationFilter === "Employee" && (
  <Select onValueChange={setOfficeFilter} value={officeFilter}>
    <SelectTrigger className="w-48 text-black">
      <SelectValue placeholder="Filter by Office" />
    </SelectTrigger>
    <SelectContent className="text-black">
      <SelectItem value="All">All Offices</SelectItem>
      <SelectItem value="MIS OFFICE">MIS OFFICE</SelectItem>
      <SelectItem value="CLINIC OFFICE">CLINIC OFFICE</SelectItem>
      <SelectItem value="CCIS OFFICE">CCIS OFFICE</SelectItem>
    </SelectContent>
  </Select>
)}

{/* Chief Complaint Filter */}
<Select onValueChange={setChiefComplaintFilter} value={chiefComplaintFilter}>
  <SelectTrigger className="w-48 text-black">
    <SelectValue placeholder="Filter by Chief Complaint" />
  </SelectTrigger>
  <SelectContent className="text-black">
    <SelectItem value="Cough">Cough</SelectItem>
    <SelectItem value="Stomachache">Stomachache</SelectItem>
    <SelectItem value="Headache">Headache</SelectItem>
    <SelectItem value="Fever">Fever</SelectItem>
    <SelectItem value="Low Bowel Movement">Low Bowel Movement</SelectItem>
  </SelectContent>
</Select>

<Button onClick={handleFilter}>Apply Filter</Button>
<Button onClick={resetFilters} variant="outline">Reset Filter</Button>
<button
        onClick={() => setShowReport(true)}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
      >
        View Annual Report
      </button>

      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-4/5 h-4/5 overflow-auto">
            <button
              onClick={() => setShowReport(false)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              ✕
            </button>
            <MedicalServicesAnnualReport />
          </div>
        </div>
      )}

              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnosis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        College/Office
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
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
                        <td className="px-6 py-4 text-black whitespace-nowrap">{appointment.occupation}</td>
                        <td className="px-6 py-4 text-black whitespace-nowrap">
                          {appointment.occupation === "Student" ? appointment.college : appointment.office}
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
            <DialogTitle className=" text-red-700">
              Delete Appointment for <strong className="text-black">{appointmentToDelete?.patientName}</strong>?
            </DialogTitle>
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

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
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
                <ReactSelect
                  isMulti
                  options={[
                    { value: "Cough", label: "Cough" },
                    { value: "Fever", label: "Fever" },
                    { value: "Headache", label: "Headache" },
                    { value: "Stomachache", label: "Stomachache" },
                    { value: "Low Bowel Movement", label: "Low Bowel Movement" }
                  ]}
                  value={selectedChiefComplaints}
                  onChange={(selectedOptions: any) => setSelectedChiefComplaints(selectedOptions)}
                  className="react-select-container"
                  classNamePrefix="react-select"
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
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
              className="border-blue-700 hover:bg-white hover:text-blue-700 bg-blue-700 text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStatusDialogSubmit}
              className="bg-blue-700 text-white hover:bg-white hover:text-blue-700 border border-blue-700"
            >
              {selectedStatus === "Cancelled" ? "Confirm Cancellation" : "Complete Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;