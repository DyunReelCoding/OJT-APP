"use client";

import { useState } from "react";
import { Client, Databases } from "appwrite";
import { Button } from "@/components/ui/button";

interface AppointmentFormProps {
  userId: string;
}

const AppointmentForm = ({ userId }: AppointmentFormProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [patientName, setPatientName] = useState("");

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
  
  const databases = new Databases(client);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b96b0800349392bb1c", // Updated to match APPOINTMENT_COLLECTION_ID from .env
        "unique()",
        {
          patientName,
          date,
          time,
          reason,
          status: "Scheduled",
          userid: userId
        }
      );

      // Reset form
      setPatientName("");
      setDate("");
      setTime("");
      setReason("");

      alert("Appointment scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("Failed to schedule appointment. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient Name</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            rows={4}
            required
          />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Schedule Appointment
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm; 