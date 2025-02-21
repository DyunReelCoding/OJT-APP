"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Doctors } from "@/constants";
import { Client, Databases, ID } from "appwrite";

const AppointmentSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  doctor: z.string().min(1, "Doctor selection is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().min(1, "Reason for visit is required"),
  notes: z.string().optional(),
});

const AppointmentForm = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      patientName: "",
      doctor: "",
      date: "",
      time: "",
      reason: "",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof AppointmentSchema>) => {
    setIsLoading(true);
    try {
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
      
      const databases = new Databases(client);
      
      await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
        ID.unique(),
        {
          ...values,
          userId,
          status: "Scheduled",
        }
      );

      form.reset();
      // Show success message or redirect
    } catch (error) {
      console.error("Error creating appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Patient Name *</label>
          <Input
            {...form.register("patientName")}
            placeholder="Enter patient name"
            className="w-full"
          />
          {form.formState.errors.patientName && (
            <p className="text-red-500 text-sm">{form.formState.errors.patientName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Doctor *</label>
          <Select onValueChange={(value) => form.setValue("doctor", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a doctor" />
            </SelectTrigger>
            <SelectContent>
              {Doctors.map((doctor) => (
                <SelectItem key={doctor.value} value={doctor.value}>
                  {doctor.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.doctor && (
            <p className="text-red-500 text-sm">{form.formState.errors.doctor.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date *</label>
          <Input
            {...form.register("date")}
            type="date"
            className="w-full"
          />
          {form.formState.errors.date && (
            <p className="text-red-500 text-sm">{form.formState.errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Time *</label>
          <Input
            {...form.register("time")}
            type="time"
            className="w-full"
          />
          {form.formState.errors.time && (
            <p className="text-red-500 text-sm">{form.formState.errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Reason for Visit *</label>
        <Input
          {...form.register("reason")}
          placeholder="Enter reason for visit"
          className="w-full"
        />
        {form.formState.errors.reason && (
          <p className="text-red-500 text-sm">{form.formState.errors.reason.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Additional Notes</label>
        <Textarea
          {...form.register("notes")}
          placeholder="Enter any additional notes"
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={isLoading}
        >
          CANCEL
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          SEND
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm; 