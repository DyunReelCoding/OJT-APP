"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CustomFormField from "../ui/CustomFormField";
import { useState } from "react";
import SubmitButton from "../SubmitButton";
import { UserFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

const PatientForms = () => {
  const router = useRouter();
  const [isLoading, setIsLoding] = useState(false);

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit({
    firstName,
    middleName,
    lastName,
    suffix,
    email,
    phone,
  }: z.infer<typeof UserFormValidation>) {
    setIsLoding(true);
  
    try {
      const userData = {
        firstName,
        middleName: middleName ?? "", // Ensure it's always a string
        lastName,
        suffix: suffix ?? "", // Ensure it's always a string
        email,
        phone,
      };
  
      console.log("Submitting Data:", userData); // Debugging log
  
      const user = await createUser(userData); // Now correctly matches CreateUserParams
  
      if (user) router.push(`/patients/${user.$id}/register`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoding(false);
    }
  }
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi There!👋</h1>
          <p className="text-dark-700">Schedule your First Appointment</p>
        </section>

        {/* First Name */}
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="firstName"
          label="First Name"
          placeholder="John"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        {/* Middle Name */}
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="middleName"
          label="Middle Name"
          placeholder="Michael"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        {/* Last Name */}
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="lastName"
          label="Last Name"
          placeholder="Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        {/* Suffix */}
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="suffix"
          label="Suffix (Optional)"
          placeholder="Jr., Sr., III"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        {/* Email */}
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="JohnDoe@gmail.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />

        {/* Phone */}
        <CustomFormField
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Phone Number"
          placeholder="091234567"
        />

        <SubmitButton isLoading={isLoading}> Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default PatientForms;
