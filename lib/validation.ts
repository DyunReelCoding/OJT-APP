import { z } from "zod";

export const UserFormValidation = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters")
    .regex(/^[A-Za-z\s'-]+$/, "First name must contain only letters"),

  middleName: z
    .string()
    .max(50, "Middle name must be at most 50 characters")
    .regex(/^[A-Za-z\s'-]*$/, "Middle name must contain only letters")
    .optional(),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters")
    .regex(/^[A-Za-z\s'-]+$/, "Last name must contain only letters"),

  suffix: z
    .string()
    .max(10, "Suffix must be at most 10 characters")
    .regex(/^(Jr\.?|Sr\.?|II|III|IV|V|VI)?$/, "Invalid suffix format")
    .optional(),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Invalid phone number"),
});

export const PatientFormValidation = z.object({
  firstName: z
  .string()
  .min(2, "First name must be at least 2 characters")
  .max(50, "First name must be at most 50 characters")
  .regex(/^[A-Za-z\s'-]+$/, "First name must contain only letters"),

middleName: z
  .string()
  .max(50, "Middle name must be at most 50 characters")
  .regex(/^[A-Za-z\s'-]*$/, "Middle name must contain only letters")
  .optional(), // Optional field

lastName: z
  .string()
  .min(2, "Last name must be at least 2 characters")
  .max(50, "Last name must be at most 50 characters")
  .regex(/^[A-Za-z\s'-]+$/, "Last name must contain only letters"),
disabilityType: z
  .string()
  .max(50, "Disability Type must be at most 50 characters")
  .regex(/^[A-Za-z\s'-]*$/, "Disability Type must contain only letters")
  .optional(), // Optional field
disabilityDetails: z
  .string()
  .max(50, "Disability Details must be at most 50 characters")
  .regex(/^[A-Za-z\s'-]*$/, "Disability Details must contain only letters")
  .optional(), // Optional field

suffix: z
  .string()
  .max(10, "Suffix must be at most 10 characters")
  .regex(/^(Jr\.?|Sr\.?|II|III|IV|V|VI)?$/, "Invalid suffix format")
  .optional(), // Optional field
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Invalid phone number"),
  idNumber: z
    .string()
    .min(8, "ID number must be at least 8 characters")
    .max(50, "ID number must be at most 8 characters"),
  age: z
    .string()
    .min(1, "Age must be at least 1 character")
    .max(5, "Age must be at most 5 characters"),
    
  bloodType: z
    .string()
    .min(1, "Blood type must be at least 1 character")
    .max(8, "Blood type must be at most 10 characters"),
  religion: z
    .string()
    .min(1, "Religion must be at least 1 character")
    .max(50, "Religion must be at most 50 characters"),
  program: z
    .string()
    .min(4, "Blood type must be at least 50 character")
    .max(100, "Blood type must be at most 100 characters"),
  yearLevel: z
  .string()
  .min(1, "Year level must be at least 1 characters")
  .max(100, "Year level must be at most 100 characters"),

weight: z
  .string()
  .min(1, "Weight is required")
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Weight must be a valid number",
  }),

height: z
  .string()
  .min(1, "Height is required")
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Height must be a valid number",
  }),


bmi: z.string().optional(),
bmiCategory: z.string().optional(),
  birthDate: z.coerce.date(),
  gender: z.enum(["male", "female", "other"]),
  civilStatus: z.enum(["Single", "Married", "Solo Parent", "Widowed", "Divorced"]),
  personWithDisability: z.enum(["Yes", "No"]),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters"),
  occupation: z
    .string()
    .min(2, "Occupation must be at least 2 characters")
    .max(500, "Occupation must be at most 500 characters"),
  emergencyContactName: z
    .string()
    .min(2, "Contact name must be at least 2 characters")
    .max(50, "Contact name must be at most 50 characters"),
  emergencyContactNumber: z
    .string()
    .refine(
      (emergencyContactNumber) => /^\+\d{10,15}$/.test(emergencyContactNumber),
      "Invalid phone number"
    ),
  insuranceProvider: z
  .string()
  .max(50, "Insurance name must be at most 50 characters")
  .optional(),


insurancePolicyNumber: z
  .string()
  .max(50, "Policy number must be at most 50 characters")
  .optional(),
  
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  identificationType: z.string().optional(),
  identificationNumber: z.string().optional(),
  identificationDocument: z
  .custom<File[]>()
  .refine((files) => files && files.length > 0, {
    message: "Scanned copy of identification document is required.",
  }),

  treatmentConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "You must consent to treatment in order to proceed",
    }),
  disclosureConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "You must consent to disclosure in order to proceed",
    }),
  privacyConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "You must consent to privacy in order to proceed",
    }),
});

export const CreateAppointmentSchema = z.object({
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Select at least one doctor"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Select at least one doctor"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case "create":
      return CreateAppointmentSchema;
    case "cancel":
      return CancelAppointmentSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}