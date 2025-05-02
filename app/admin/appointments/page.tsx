"use client";

import { useEffect, useState } from "react";
import { Client, Databases, ID, Query } from "appwrite";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, RefreshCw, CheckCircle, X } from "lucide-react";
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
import MedicalServicesMonthlyReport from "@/components/MedicalServicesMonthlyReport";
import MedicalServicesQuarterlyReport from "@/components/MedicalServicesQuarterlyReport";
import DentalServicesAnnualReport from "@/components/DentalAnnualReport";

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
  cancellationReason?: string;
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
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isDiagnosisDialogOpen, setIsDiagnosisDialogOpen] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);
  const [bpFilter, setBpFilter] = useState("");
  const [chiefComplaintFilter, setChiefComplaintFilter] = useState("");
  const [occupationFilter, setOccupationFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Status change dialog states
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [bloodPressure, setBloodPressure] = useState("");
  const [notes, setNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showReport2, setShowReport2] = useState(false);
  const [showReport3, setShowReport3] = useState(false);
  const [showReport4, setShowReport4] = useState(false);

  // Chief complaints states
  const [newChiefComplaint, setNewChiefComplaint] = useState("");
  const [chiefComplaintsList, setChiefComplaintsList] = useState([
    { value: "Cough", label: "Cough" },
    { value: "Fever", label: "Fever" },
    { value: "Headache", label: "Headache" },
    { value: "Stomachache", label: "Stomachache" },
    { value: "Low Bowel Movement", label: "Low Bowel Movement" },
    { value: "Sore Throat", label: "Sore Throat" },
    { value: "Fatigue", label: "Fatigue" },
    { value: "Dizziness", label: "Dizziness" },
  ]);
  const [selectedChiefComplaints, setSelectedChiefComplaints] = useState<{ value: string; label: string }[]>([]);

  // Dental types states
  const [newDentalType, setNewDentalType] = useState('');
  const [dentalTypesList, setDentalTypesList] = useState<{ label: string; value: string }[]>([]);
  const [selectedDentalTypes, setSelectedDentalTypes] = useState<{ label: string; value: string }[]>([]);

  const [offices, setOffices] = useState<string[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

  const databases = new Databases(client);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDentalTypes();
    
    const fetchData = async () => {
      try {
        // Fetch offices
        const officeRes = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_OFFICETYPE_COLLECTION_ID!
        );
        setOffices(officeRes.documents.map((doc) => doc.name));

        // Fetch colleges
        const collegeRes = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_COLLEGE_COLLECTION_ID!
        );
        setColleges(collegeRes.documents.map((doc) => doc.name));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchDentalTypes = async () => {
    try {
      const res = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_DENTALTYPE_COLLECTION_ID!
      );
      const options = res.documents.map((doc) => ({
        label: doc.name,
        value: doc.$id
      }));
      setDentalTypesList(options);
    } catch (error) {
      console.error("Failed to fetch dental types:", error);
    }
  };

  const handleAddDentalType = async () => {
    if (!newDentalType.trim()) return;
  
    try {
      const newDoc = await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_DENTALTYPE_COLLECTION_ID!,
        ID.unique(),
        { name: newDentalType }
      );
  
      setDentalTypesList(prev => [...prev, { label: newDoc.name, value: newDoc.$id }]);
      setNewDentalType('');
    } catch (error) {
      console.error("Failed to add dental type:", error);
    }
  };

  const handleDeleteDentalType = async (id: string) => {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_DENTALTYPE_COLLECTION_ID!,
        id
      );

      setSelectedDentalTypes(prev => prev.filter(item => item.value !== id));
      setDentalTypesList(prev => prev.filter(item => item.value !== id));
    } catch (error) {
      console.error('Failed to delete dental type:', error);
    }
  };

  const CustomDentalOption = (props: { data: any; innerRef: any; innerProps: any; }) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex justify-between items-center p-2 hover:bg-gray-200 cursor-pointer"
      >
        <span>{data.label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteDentalType(data.value);
          }}
          className="text-red-600 hover:text-red-800"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  const handleAddChiefComplaint = () => {
    if (newChiefComplaint.trim() === "") return;

    const newComplaint = {
      value: newChiefComplaint,
      label: newChiefComplaint,
    };

    setChiefComplaintsList([...chiefComplaintsList, newComplaint]);
    setNewChiefComplaint("");
  };

  const handleDeleteChiefComplaint = (value: string) => {
    const updatedList = chiefComplaintsList.filter((complaint) => complaint.value !== value);
    setChiefComplaintsList(updatedList);
  };

  const CustomOption = (props: { data: any; innerRef: any; innerProps: any; }) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="flex justify-between items-center p-2 hover:bg-gray-200 cursor-pointer">
        <span>{data.label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteChiefComplaint(data.value);
          }}
          className="text-red-600 hover:text-red-800"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  const fetchAppointments = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!
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
      
      const collegeMatch = occupationFilter === "Student" 
        ? !collegeFilter || collegeFilter === "All" || appointment.college === collegeFilter 
        : true;

      const officeMatch = occupationFilter === "Employee"
        ? !officeFilter || officeFilter === "All" || appointment.office === officeFilter
        : true;
  
      let chiefComplaintMatch = true;
      if (chiefComplaintFilter) {
        if (!appointment.diagnosis) {
          chiefComplaintMatch = false;
        } else {
          try {
            const diagnosisData = JSON.parse(appointment.diagnosis);
            
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
          process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
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
        const truncatedNotes = notes.length > 500 ? notes.substring(0, 500) + "..." : notes;

        const chiefComplaintsArray = selectedChiefComplaints.map((complaint) => complaint.value);

        const diagnosisData = JSON.stringify({
          bloodPressure,
          chiefComplaint: chiefComplaintsArray,
          notes: truncatedNotes,
          dental: selectedDentalTypes.map((item) => item.label).join(", "),
        });

        if (diagnosisData.length > 1000) {
          throw new Error("Diagnosis data exceeds the maximum length of 255 characters.");
        }

        updateData.diagnosis = diagnosisData;
      }

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
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
      setSelectedChiefComplaints([]);
      setNotes("");
      setCancellationReason("");
      setSelectedDentalTypes([]);
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
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
                {/* Occupation Filter */}
                <Select onValueChange={setOccupationFilter} value={occupationFilter}>
                  <SelectTrigger className="w-48 text-black">
                    <SelectValue placeholder="Filter by Occupation" />
                  </SelectTrigger>
                  <SelectContent className="text-black bg-white">
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
                    <SelectContent className="text-black bg-white">
                      <SelectItem value="All">All Colleges</SelectItem>
                      {colleges.map((college) => (
                        <SelectItem key={college} value={college}>
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Employee → Office Filter */}
                {occupationFilter === "Employee" && (
                  <Select onValueChange={setOfficeFilter} value={officeFilter}>
                    <SelectTrigger className="w-48 text-black">
                      <SelectValue placeholder="Filter by Office" />
                    </SelectTrigger>
                    <SelectContent className="text-black bg-white">
                      <SelectItem value="All">All Offices</SelectItem>
                      {offices.map((office) => (
                        <SelectItem key={office} value={office}>
                          {office}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Chief Complaint Filter */}
                <Select onValueChange={setChiefComplaintFilter} value={chiefComplaintFilter}>
                  <SelectTrigger className="w-48 text-black">
                    <SelectValue placeholder="Filter by Chief Complaint" />
                  </SelectTrigger>
                  <SelectContent className="text-black bg-white">
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
                  className="bg-blue-700 text-white font-bold py-2 px-4 rounded border-2 border-blue-700 hover:bg-white hover:text-blue-700"
                >
                  View Annual Report
                </button>

                {showReport && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative w-4/5 h-4/5 overflow-auto">
                      <button
                        onClick={() => setShowReport(false)}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md"
                      >
                        ✕
                      </button>
                      <MedicalServicesAnnualReport />
                    </div>
                  </div>
                )}
                {/* Monthly Report */}
                <button
                  onClick={() => setShowReport2(true)}
                  className="bg-blue-700 text-white font-bold py-2 px-4 rounded border-2 border-blue-700 hover:bg-white hover:text-blue-700"
                >
                  View Monthly Report
                </button>

                {showReport2 && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative w-4/5 h-4/5 overflow-auto">
                      <button
                        onClick={() => setShowReport2(false)}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md"
                      >
                        ✕
                      </button>
                      <MedicalServicesMonthlyReport />
                    </div>
                  </div>
                )}
                {/* Quarterly Report */}
                <button
                  onClick={() => setShowReport3(true)}
                  className="bg-blue-700 text-white font-bold py-2 px-4 rounded border-2 border-blue-700 hover:bg-white hover:text-blue-700"
                >
                  View Quarterly Report
                </button>

                {showReport3 && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative w-4/5 h-4/5 overflow-auto">
                      <button
                        onClick={() => setShowReport3(false)}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md"
                      >
                        ✕
                      </button>
                      <MedicalServicesQuarterlyReport />
                    </div>
                  </div>
                )}
                {/* Quarterly Report */}
                <button
                  onClick={() => setShowReport4(true)}
                  className="bg-blue-700 text-white font-bold py-2 px-4 rounded border-2 border-blue-700 hover:bg-white hover:text-blue-700"
                >
                  View Dental Report
                </button>

                {showReport4 && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative w-4/5 h-4/5 overflow-auto">
                      <button
                        onClick={() => setShowReport4(false)}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-md"
                      >
                        ✕
                      </button>
                      <DentalServicesAnnualReport />
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
                            className="hover:bg-red-700 hover:text-white px-5"
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
            <DialogTitle className="text-red-700">
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
                  <p className="text-sm"><strong>Dental Type:</strong> {selectedDiagnosis.dental || 'N/A'}</p>
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

                {/* Input field and button for adding a new chief complaint */}
                <div className="flex gap-2">
                  <Input
                    value={newChiefComplaint}
                    onChange={(e) => setNewChiefComplaint(e.target.value)}
                    placeholder="Add new chief complaint"
                    className="bg-white border border-blue-700 text-black"
                  />
                  <Button
                    type="button"
                    className="bg-blue-700 text-white hover:bg-white hover:text-blue-700 border border-blue-700"
                    onClick={handleAddChiefComplaint}
                  >
                    Add
                  </Button>
                </div>

                {/* Multi-select dropdown for chief complaints */}
                <ReactSelect
                  isMulti
                  options={chiefComplaintsList}
                  value={selectedChiefComplaints}
                  onChange={(selectedOptions: any) => setSelectedChiefComplaints(selectedOptions)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  components={{ Option: CustomOption }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dental Type</label>

                <div className="flex gap-2">
                  <Input
                    value={newDentalType}
                    onChange={(e) => setNewDentalType(e.target.value)}
                    placeholder="Add new dental type"
                    className="bg-white border border-blue-700 text-black"
                  />
                  <Button
                    type="button"
                    className="bg-blue-700 text-white hover:bg-white hover:text-blue-700 border border-blue-700"
                    onClick={handleAddDentalType}
                  >
                    Add
                  </Button>
                </div>

                <ReactSelect
                  isMulti
                  options={dentalTypesList}
                  value={selectedDentalTypes}
                  onChange={(option) => setSelectedDentalTypes(option as { label: string; value: string }[])}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select dental types"
                  components={{ Option: CustomDentalOption }}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      cursor: 'pointer',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      cursor: 'pointer',
                      backgroundColor: state.isFocused ? '#e0e0e0' : '',
                    }),
                  }}
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