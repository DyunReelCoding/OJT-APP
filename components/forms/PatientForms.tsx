"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../ui/CustomFormField";
import { useState } from "react";
import SubmitButton from "../SubmitButton";
import { UserFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import OTPModal from "@/components/OTPModal";

export enum FormFieldType {
  INPUT = "input",
  PHONE_INPUT = "phoneInput",
  DATE_PICKER = "datePicker",
  TEXTAREA = "textarea",
  SELECT = "select",
  CHECKBOX = "checkbox",
  SKELETON = "skeleton",
}

const PatientForms = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
     
      email: "",
      
    },
  });

  const onSubmit = async (formData: z.infer<typeof UserFormValidation>) => {
    setIsLoading(true);
    setEmail(formData.email);

    try {
      const otpResponse = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok) {
        setOtp(otpData.otp);
        setShowModal(true);
      } else {
        alert(otpData.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Error sending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (enteredOtp: string) => {
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, enteredOtp }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.error || "Invalid OTP.");
        return;
      }
  
      // **Delete OTP record after successful verification**
      await fetch("/api/otp/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      // Proceed with patient verification after OTP validation
      const checkResponse = await fetch("/api/patient/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const checkData = await checkResponse.json();
  
      if (checkResponse.ok) {
        if (checkData.patient) {
          const { userId, occupation } = checkData.patient;
  
          if (occupation?.toLowerCase() === "student") {
            router.push(`/patients/${userId}/student`);
          } else if (occupation?.toLowerCase() === "employee") {
            router.push(`/patients/${userId}/employee`);
          }
        } else if (checkData.userId) {
          router.push(`/patients/${checkData.userId}/register?email=${encodeURIComponent(email)}`);
        }
      }
    } catch (err) {
      console.error("Error verifying patient:", err);
      alert("Failed to verify patient.");
    }
  };
  
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
          <section className="mb-12 space-y-4">
            <h1 className="header text-green-400">Hi There! 👋</h1>
            <p className="text-dark-700">Schedule your First Appointment</p>
          </section>

        
          <CustomFormField fieldType={FormFieldType.INPUT} control={form.control} name="email" label="Email" placeholder="JohnDoe@gmail.com" iconSrc="/assets/icons/email.svg" iconAlt="email" />
        

          <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
        </form>
      </Form>

      {showModal && <OTPModal email={email} otp={otp} onClose={() => setShowModal(false)} onVerify={handleOtpVerification} />}
    </>
  );
};

export default PatientForms;
