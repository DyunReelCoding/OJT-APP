"use client";
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
// import { Button } from "@/components/ui/button"
import { Form, FormControl } from "@/components/ui/form"
import CustomFormField from "../ui/CustomFormField"
import { useState } from "react"
import SubmitButton from "../SubmitButton"
import { PatientFormValidation, UserFormValidation } from "@/lib/validation"
import { useRouter } from "next/navigation"
// import { createUser, registerPatient } from "@/lib/actions/patient.actions"
import { registerPatient } from "@/lib/actions/patient.actions"
import { FormFieldType } from "./PatientForms";
import { RadioGroup } from "@radix-ui/react-radio-group";
// import { Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants";
import { GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants";
import { RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
// import Image from "next/image";
import FileUploader from "../FileUploader";
import { useEffect } from "react";
import SuccessMessage from "../SuccessMessage";
import { Client, Databases } from "appwrite";
import { useSearchParams } from "next/navigation";

import dayjs from "dayjs";

// Load environment variables
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID!;
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_ALLERGIES_COLLECTION_ID!;
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT!;
const MEDICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_CURRENTMEDICATION_COLLECTION_ID!;
const OCCUPATION_COLLECTION_ID = process.env.NEXT_PUBLIC_OCCUPATIONTYPE_COLLECTION_ID!;
const OFFICETYPE_COLLECTION_ID = process.env.NEXT_PUBLIC_OFFICETYPE_COLLECTION_ID!;
const PROGRAMTYPES_COLLECTION_ID = process.env.NEXT_PUBLIC_PROGRAMTYPES_COLLECTION_ID!;
const FAMILYMEDICALHISTORY_COLLECTION_ID = process.env.NEXT_PUBLIC_FAMILYMEDICALHISTORY_COLLECTION_ID!;
const PASTMEDICALHISTORY_COLLECTION_ID = process.env.NEXT_PUBLIC_PASTMEDICALHISTORY_COLLECTION_ID!;
const COLLEGE_COLLECTION_ID = process.env.NEXT_PUBLIC_COLLEGE_COLLECTION_ID!;

const RegisterForm = ({ user }: { user: User }) => { 
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allergy, setAllergy] = useState("");
  const [allergies, setAllergies] = useState<string[]>(["None"]);
  const [medications, setMedications] = useState<string[]>([]);
  const [medication, setMedication] = useState<string>("");
  const [occupations, setOccupations] = useState<string[]>([]);
  const [selectedOccupation, setSelectedOccupation] = useState("");
  const [officeTypes, setOfficeTypes] = useState<string[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [programTypes, setProgramTypes] = useState<string[]>([]);
  const [collegeTypes, setCollegeTypes] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [familyHistories, setFamilyHistories] = useState<string[]>([]);
  const [familyMedicalHistories, setFamilyMedicalHistories] = useState<string[]>([]);
  const [pastMedicalHistories, setPastMedicalHistories] = useState<string[]>([]);
  const [showFamilyOtherField, setShowFamilyOtherField] = useState(false);
  const [showPastOtherField, setShowPastOtherField] = useState(false);
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [selectedCollege, setSelectedCollege] = useState("");



  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      email: emailFromQuery, // Pre-fill email
      phone: "",
      weight: "",
      height: "",
      bmi: "", 
      bmiCategory: "",
      occupation: "",
      college: "",
    },
  });

  const birthDate = form.watch("birthDate");

  useEffect(() => {
    if (birthDate) {
      const birthYear = dayjs(birthDate).year();
      const currentYear = dayjs().year();
      const calculatedAge = currentYear - birthYear;
      form.setValue("age", calculatedAge.toString(), { shouldValidate: true });
    }
  }, [birthDate, form]);

  const occupation = form.watch("occupation", "").toLowerCase().replace(/\s+$/, "");
  const isStudent = occupation === "student";
  const isEmployee = occupation === "employee";

  useEffect(() => {
    if (isStudent) {
      form.setValue("program", "");
      form.setValue("yearLevel", "");
      form.setValue("college", "");
      form.setValue("office", "None");
    } else if (isEmployee) {
      form.setValue("program", "None");
      form.setValue("yearLevel", "None");
      form.setValue("college", "None");
      form.setValue("office", "");
    } else {
      form.setValue("program", "None");
      form.setValue("yearLevel", "None");
      form.setValue("college", "None");
      form.setValue("office", "");
    }
  }, [isStudent, isEmployee, form]);

  useEffect(() => {
    const client = new Client();
    client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchAllergies = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        setAllergies(["None", ...response.documents.map((doc) => doc.name)]);
      } catch (error) {
        console.error("Error fetching allergies:", error);
      }
    };

    const fetchMedications = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, MEDICATIONS_COLLECTION_ID);
        setMedications(response.documents.map((doc) => doc.name));
      } catch (error) {
        console.error("Error fetching medications:", error);
      }
    };

    const fetchOccupations = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, OCCUPATION_COLLECTION_ID);
        setOccupations(response.documents.map((doc) => doc.name));
      } catch (error) {
        console.error("Error fetching occupations:", error);
      }
    };
    
    const fetchProgramTypes = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_PROGRAMTYPES_COLLECTION_ID!
        );
        setProgramTypes(response.documents.map((doc) => doc.name));
      } catch (error) {
        console.error("Error fetching program types:", error);
      }
    };

    const fetchOfficeTypes = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, OFFICETYPE_COLLECTION_ID);
        setOfficeTypes(response.documents.map((doc) => doc.name));
      } catch (error) {
        console.error("Error fetching office types:", error);
      }
    };
  
    const fetchFamilyHistories = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, FAMILYMEDICALHISTORY_COLLECTION_ID);
        setFamilyMedicalHistories(response.documents.map((doc) => doc.name));
      } catch (error) {
        console.error("Error fetching family medical histories:", error);
      }
    };
    const fetchPastMedicalHistories = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, PASTMEDICALHISTORY_COLLECTION_ID);
        setPastMedicalHistories(response.documents.map((doc) => doc.name));
      } catch (error) {
        console.error("Error fetching past medical histories:", error);
      }
    };
    const fetchCollegeTypes = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID!,
          process.env.NEXT_PUBLIC_COLLEGE_COLLECTION_ID!
        );
        setCollegeTypes(response.documents.map((doc) => doc.name));
      } catch (error) {
        console.error("Error fetching program types:", error);
      }
    };


    fetchAllergies();
    fetchMedications();
    fetchOccupations();
    fetchProgramTypes();
    fetchOfficeTypes();
    fetchFamilyHistories();
    fetchPastMedicalHistories();
    fetchCollegeTypes()
  }, []);

  const weightStr = form.watch("weight");
  const heightStr = form.watch("height");
  const ageStr = form.watch("age");

  const weight = Number(weightStr);
  const height = Number(heightStr);
  const age = Number(ageStr);

  useEffect(() => {
    if (!isNaN(weight) && !isNaN(height) && height > 0) {
      const bmiValue = weight / (height * height);
      form.setValue("bmi", bmiValue.toFixed(2));

      let bmiCategory = "";
      if (age < 18) {
        bmiCategory = bmiValue < 18.5 ? "Underweight" : bmiValue < 24.9 ? "Normal weight" : bmiValue < 29.9 ? "Overweight" : "Obese";
      } else if (age <= 34) {
        bmiCategory = bmiValue < 18.5 ? "Underweight" : bmiValue < 24.9 ? "Normal weight" : bmiValue < 29.9 ? "Overweight" : "Obese";
      } else {
        bmiCategory = bmiValue < 18.5 ? "Underweight" : bmiValue < 24.9 ? "Normal weight" : bmiValue < 30 ? "Overweight" : "Obese";
      }
      form.setValue("bmiCategory", bmiCategory);
    } else {
      form.setValue("bmi", "");
      form.setValue("bmiCategory", "");
    }
  }, [form.watch("weight"), form.watch("height"), form.watch("age")]);

  async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
    setIsLoading(true);
    let formData;

    if (values.identificationDocument?.length > 0) {
      const blobFile = new Blob([values.identificationDocument[0]], {
        type: values.identificationDocument[0].type,
      });
      formData = new FormData();
      formData.append("blobFile", blobFile);
      formData.append("fileName", values.identificationDocument[0].name);
    }
  
    try {
      const patientData = {
        ...values,
        userId: user.$id,
        birthDate: new Date(values.birthDate),
        identificationDocument: formData,
      };

      // @ts-ignore
      const patient = await registerPatient(patientData);
      if (patient) {
        form.reset();
        setSuccessMessage("Registration successful! You have been registered successfully.");
        const occupation = values.occupation.toLowerCase();

        if (occupation === "student") {
          router.push(`/patients/${patient.$id}/student`);
        } else if (occupation === "employee") {
          router.push(`/patients/${patient.$id}/employee`);
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} 
    className="space-y-12 flex-1">
      {successMessage && <SuccessMessage message={successMessage} />}
      <section className="space-y-4">
        <h1 className="header text-green-400">Welcome!👋</h1>
        <p className="text-dark-600">Let us know about yourself.</p>
      </section>

      <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header text-blue-700">Personal Information</h2> 
          </div>
      </section>
      <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="firstName"
          label="First Name"
          placeholder="John"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
            backgroundColor="bg-gray-50"
            required={true}
        />
          
        

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="middleName"
          label="Middle Name"
          placeholder="Michael"
            backgroundColor="bg-gray-50"
          iconAlt="user"
        />

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="lastName"
          label="Last Name"
          placeholder="Doe"
            backgroundColor="bg-gray-50"
          iconAlt="user"
            required={true}
        />

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="suffix"
          label="Suffix (if any)"
          placeholder="Jr., Sr., III, etc."
            backgroundColor="bg-gray-50"
          iconAlt="user"
        />

      </div>
       <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="idNumber"
          label="ID number"
          placeholder="211-01338"
            backgroundColor="bg-gray-50"
            required={true}
        />
        <CustomFormField
        fieldType={FormFieldType.DATE_PICKER}
            control={form.control}
        name="birthDate"
        label="Date of Birth"
        backgroundColor="bg-gray-50"
        required={true}
      />
           
     </div>
      
      <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email"
            placeholder="JohnDoe@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
            backgroundColor="bg-gray-50"
            readOnly={true} // ✅ This makes the input read-only
            required={true}
        />

        <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="091234567"
            required={true}
        />
      </div>
      <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField
        fieldType={FormFieldType.INPUT}
                control={form.control}
        name="age"
        label="Age"
        placeholder="21"
        backgroundColor="bg-gray-50"
        required={true}
        readOnly={true} // Prevent manual input
            />
        <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="gender"
                label="Gender"
            backgroundColor="bg-gray-50"
            required={true}
            renderSkeleton={(field) => (
                    <FormControl>
                <RadioGroup className="flex flex-11 gap-6 xl:justify-between text-black"
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                            {GenderOptions.map((option) => (
                                <div key={option} className="radio-group">
                      <RadioGroupItem value={option} id={option} />
                                    <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                                </div>
                         ))}
                        </RadioGroup>
                    </FormControl>
                )}
            />
      </div>
      
       <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="address"
                label="Address"
                placeholder="Ampayon, Butuan City"
            required={true}
            />
       <CustomFormField
  fieldType={FormFieldType.SKELETON}
  control={form.control}
  name="occupation"
  label="Occupation"
            required={true}
  renderSkeleton={(field) => (
    <div className="text-black">
      <FormControl>
        <Select
          onValueChange={(value) => {
            setSelectedOccupation(value);
            form.setValue("occupation", value); // Set the selected value in the form
          }}
          value={field.value || ""} // Clear the value if field.value is undefined or null
        >
                    <SelectTrigger className="w-full bg-gray-50">
            <SelectValue placeholder="Select Occupation" />
          </SelectTrigger>
                    <SelectContent className="bg-white text-black border-2 border-blue-700">
            {occupations.map((occupation) => (
                        <SelectItem className="hover:bg-blue-100" key={occupation} value={occupation}>
                {occupation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
    </div>
  )}
/>


    
      </div>
      <div className="flex flex-col gap-6 xl:flex-row">
      <CustomFormField
    fieldType={FormFieldType.SKELETON}
    control={form.control}
    name="civilStatus"
    label="Civil Status"
            required={true}
    renderSkeleton={(field) => (
        <FormControl>
            <RadioGroup
                  className="flex flex-wrap gap-6 xl:justify-between text-black"
                onValueChange={field.onChange}
                value={field.value || ""} // Ensure it resets to empty
            >
                {["Single", "Married", "Solo Parent", "Widowed", "Divorced"].map((status) => (
                    <div key={status} className="radio-group flex items-center gap-2">
                        <RadioGroupItem value={status} id={status} />
                        <Label htmlFor={status} className="cursor-pointer">
                            {status}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </FormControl>
    )}
/>

</div>
      <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="bloodType"
          label="Blood Type"
          placeholder="0"
            required={true}
        />
        <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="religion"
            label="Religion"
            placeholder="Roman Catholic"
            required={true}
      />
     </div>
     <div className="flex flex-col gap-6 xl:flex-row">
      {/* Weight Field */}
      <CustomFormField
        fieldType={FormFieldType.INPUT}
        control={form.control}
        name="weight"
        label="Weight (kg)"
        placeholder="70"
            required={true}
      />

      {/* Height Field */}
      <CustomFormField
        fieldType={FormFieldType.INPUT}
        control={form.control}
        name="height"
        label="Height (m)"
        placeholder="1.75"
            required={true}
      />

  
</div>
<div className="flex flex-col gap-6 xl:flex-row">
      {/* BMI Field - Readonly */}
      <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="bmi"
          label="BMI"
          placeholder="Calculated BMI"
            readOnly={true}
        />

      {/* Add BMI category field */}
      <CustomFormField
        fieldType={FormFieldType.INPUT}
        control={form.control}
        name="bmiCategory"
        label="BMI Category"
        placeholder="Normal weight"
            readOnly={true}  // Disable it since it's auto-calculated
      />

</div>

{isStudent && (
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
  fieldType={FormFieldType.SKELETON}
  control={form.control}
  name="college"
  label="College"
  required={true}
  renderSkeleton={(field) => (
    <div className="text-black">
      <FormControl>
        <Select
          onValueChange={(value) => {
            setSelectedCollege(value);
            form.setValue("college", value); // Set selected value in the form
          }}
          value={field.value || ""} // Clear the value if undefined/null
        >
          <SelectTrigger className="w-full bg-gray-50">
            <SelectValue placeholder="Select College" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black border-2 border-blue-700">
            {collegeTypes.map((college) => (
              <SelectItem className="hover:bg-blue-100" key={college} value={college}>
                {college}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
    </div>
  )}
/>
            <CustomFormField
              fieldType={FormFieldType.SKELETON}
            control={form.control}
            name="program"
            label="Program"
              required={true}
              renderSkeleton={(field) => (
                <div className="text-black">
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        setSelectedProgram(value);
                        form.setValue("program", value); // Set the selected value in the form
                      }}
                      value={field.value || ""} // Clear the value if field.value is undefined or null
                    >
                      <SelectTrigger className="w-full bg-gray-50">
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border-2 border-blue-700">
                        {programTypes.map((program) => (
                          <SelectItem className="hover:bg-blue-100" key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </div>
              )}
            />

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="yearLevel"
            label="Year Level"
            placeholder="4"
              required={true}
          />
        </div>
      )}

{isEmployee && (
  <div className="flex flex-col gap-6 xl:flex-row">
    {/* Office dropdown */}
    <CustomFormField
      fieldType={FormFieldType.SKELETON}
      control={form.control}
      name="office"
      label="Office"
              required={true}
      renderSkeleton={(field) => (
        <div>
          <FormControl>
            <Select
              onValueChange={(value) => {
                setSelectedOffice(value);
                form.setValue("office", value);
              }}
              value={field.value || ""} // Clear the value if field.value is undefined or null
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Office Type" />
              </SelectTrigger>
                      <SelectContent className="bg-white text-black border-2 border-blue-700">
                {/* Check if officeTypes has data before rendering the dropdown */}
                {officeTypes.length > 0 ? (
                  officeTypes.map((officeType, index) => (
                            <SelectItem className="hover:bg-blue-100" key={index} value={officeType}>
                      {officeType}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value={""}>
                    No office types available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormControl>
        </div>
      )}
    />
  </div>
)}

       <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="emergencyContactName"
                label="Emergency contact name"
                placeholder="Guardian's name"
            required={true}
            />
            <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="emergencyContactNumber"
                label="Emergency contact number"
                placeholder="091234567"
            required={true}
            />
      </div>

      <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header text-blue-700">Medical Information</h2>
          </div>
      </section>

      <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="insuranceProvider"
            label="Insurance Provider"
            placeholder="Palawan Insurance"
                    
                    
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="insurancePolicyNumber"
            label="Insurance policy number"
            placeholder="ABC123456789"
          
          
          />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
      <CustomFormField
  fieldType={FormFieldType.SKELETON}
  control={form.control}
  name="allergies"
  label="Allergies (if any)"
            required={true}
  renderSkeleton={(field) => (
    <div className="text-black">
      <FormControl>
        <Select
          onValueChange={(value) => {
            setAllergy(value);
            form.setValue("allergies", value);
          }}
          defaultValue={field.value}
        >
                    <SelectTrigger className="w-full bg-gray-50">
            <SelectValue placeholder="Select Allergy" />
          </SelectTrigger>
                    <SelectContent className="bg-white text-black border-2 border-blue-700 ">
            {allergies.map((allergy) => (
                        <SelectItem className="hover:bg-blue-100" key={allergy} value={allergy}>
                {allergy}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
    </div>
  )}
/>

<CustomFormField
  fieldType={FormFieldType.SKELETON}
  control={form.control}
  name="currentMedication"
  label="Current Medication (if any)"
            required={true}
  renderSkeleton={(field) => (
    <div className="text-black">
      <FormControl>
        <Select
          onValueChange={(value) => {
            setMedication(value);
            form.setValue("currentMedication", value);
          }}
          defaultValue={field.value}
        >
                    <SelectTrigger className="w-full bg-gray-50">
            <SelectValue placeholder="Select Medication" />
          </SelectTrigger>
                    <SelectContent className="bg-white text-black border-2 border-blue-700">
                      <SelectItem className="hover:bg-blue-100" key="None" value="None">
              None
            </SelectItem>
            {medications.map((medication) => (
                        <SelectItem className="hover:bg-blue-100" key={medication} value={medication}>
                {medication}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
    </div>
  )}
/>


      </div>
      <div className="flex flex-col gap-6 xl:flex-row">
      <CustomFormField
    fieldType={FormFieldType.SKELETON}
    control={form.control}
    name="personWithDisability"
    label="Person with Disability"
            required={true}
    renderSkeleton={(field) => (
        <FormControl>
            <RadioGroup
                className="flex gap-6 xl:justify-between"
                onValueChange={(value) => {
                    field.onChange(value);
                    if (value === "No") {
                        form.setValue("disabilityType", ""); // Clear selection if "No"
                        form.setValue("disabilityDetails", ""); // Clear details
                    }
                }}
                value={field.value || ""} // Ensure it resets to empty
            >
                {["Yes", "No"].map((option) => (
                    <div key={option} className="radio-group flex items-center gap-2 text-black">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                            {option}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </FormControl>
    )}
/>


{/* Show disability type selection only if "Yes" is selected */}
{form.watch("personWithDisability") === "Yes" && (
    <CustomFormField
        fieldType={FormFieldType.SKELETON}
        control={form.control}
        name="disabilityType"
        label="Type of Disability"
        renderSkeleton={(field) => (
            <FormControl>
                <RadioGroup
                    className="flex gap-6 xl:justify-between"
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                >
                    {["Physical Disabilities", "Intellectual Disabilities", "Mental Illnesses"].map((option) => (
                      <div key={option} className="radio-group flex items-center gap-2 text-black">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option} className="cursor-pointer">
                                {option}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </FormControl>
        )}
    />
)}

{/* Show textarea if a disability type is selected */}
{form.watch("disabilityType") && (
    <CustomFormField
        fieldType={FormFieldType.TEXTAREA}
        control={form.control}
        name="disabilityDetails"
        label="Specify Disability Details"
    />
)}

</div>

      <div className="flex flex-col gap-6 xl:flex-row">
          {/* Family Medical History */}
          {/* Past Medical History */}
          <CustomFormField
            fieldType={FormFieldType.SKELETON}
            control={form.control}
            name="pastMedicalHistory"
            label="Past Medical History"
            required={true}
            renderSkeleton={() => {
              const selectedHistory = form.watch("pastMedicalHistory");
              const selectedArray = typeof selectedHistory === "string" ? selectedHistory.split(",") : [];
              const isNoneSelected = selectedArray.includes("None");
              const isOthersSelected = selectedArray.includes("Others");

              // Format selected items for dropdown display
              const displayText =
                selectedArray.length > 3
                  ? `${selectedArray.slice(0, 3).join(", ")}...`
                  : selectedArray.join(", ") || "Select Past Medical History";

              return (
                <div className="text-black">
                  <FormControl>
                    <Select
                      onValueChange={() => { }}
                      value={selectedHistory || ""}
                    >
                      <SelectTrigger className="w-full bg-gray-50">
                        <SelectValue placeholder="Select Past Medical History">{displayText}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border-2 border-blue-700">
                        <div className="flex flex-col gap-2 p-2">
                          {/* None Option */}
                          <label htmlFor="None" className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              id="None"
                              name="pastMedicalHistory"
                              className="peer hidden"
                              checked={isNoneSelected}
                              onChange={() => {
                                form.setValue("pastMedicalHistory", "None");
                                setShowPastOtherField(false);
                              }}
                            />
                            <div className={`w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center ${isNoneSelected ? "bg-black" : ""}`} />
                            None
                          </label>

                          {/* Past Medical History Options */}
                          {pastMedicalHistories.map((history) => (
                            <label key={history} htmlFor={history} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={history}
                                className="peer hidden"
                                checked={selectedArray.includes(history)}
                                onChange={(e) => {
                                  let updatedSelection;

                                  if (e.target.checked) {
                                    updatedSelection = [...selectedArray.filter(item => item !== "None" && item !== "Others"), history];
                                    setShowPastOtherField(false);
                                  } else {
                                    updatedSelection = selectedArray.filter(item => item !== history);
                                  }

                                  form.setValue("pastMedicalHistory", updatedSelection.length ? updatedSelection.join(",") : "");
                                }}
                              />
                              <div className={`w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center ${selectedArray.includes(history) ? "bg-black" : ""}`} />
                              {history}
                            </label>
                          ))}

                          {/* Others Option */}
                          <label htmlFor="Others" className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              id="Others"
                              className="peer hidden"
                              checked={isOthersSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  form.setValue("pastMedicalHistory", "Others");
                                  form.setValue("pastMedicalHistory", ""); // Clear the textarea when selecting "Others"
                                  setShowPastOtherField(true);
                                } else {
                                  form.setValue("pastMedicalHistory", "");
                                  setShowPastOtherField(false);
                                }
                              }}
                            />
                            <div className={`w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center ${isOthersSelected ? "bg-black" : ""}`} />
                            Others
                          </label>
                        </div>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  {/* Show Textarea if "Others" is selected */}
                  {showPastOtherField && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="pastMedicalHistory"
                      label="Specify Past Medical History"
                      placeholder="Please specify..."
                      renderSkeleton={() => (
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded"
                          {...form.register("pastMedicalHistory")}
                          placeholder="Please specify..."
                        />
                      )}
                    />
                  )}
                </div>
              );
            }}
          />


          {/* Family Medical History */}
          <CustomFormField
            fieldType={FormFieldType.SKELETON}
            control={form.control}
            name="familyMedicalHistory"
            label="Family Medical History"
            required={true}
            renderSkeleton={() => {
              const selectedHistory = form.watch("familyMedicalHistory");
              const selectedArray = typeof selectedHistory === "string" ? selectedHistory.split(",") : [];
              const isNoneSelected = selectedArray.includes("None");
              const isOthersSelected = selectedArray.includes("Others");

              // Format selected items for dropdown display
              const displayText =
                selectedArray.length > 3
                  ? `${selectedArray.slice(0, 3).join(", ")}...`
                  : selectedArray.join(", ") || "Select Family Medical History";

              return (
                <div className="text-black">
                  <FormControl>
                    <Select
                      onValueChange={() => { }}
                      value={selectedHistory || ""}
                    >
                      <SelectTrigger className="w-full bg-gray-50">
                        <SelectValue placeholder="Select Family Medical History">{displayText}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border-2 border-blue-700">
                        <div className="flex flex-col gap-2 p-2">
                          {/* None Option */}
                          <label htmlFor="None" className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              id="None"
                              name="familyMedicalHistory"
                              className="peer hidden"
                              checked={isNoneSelected}
                              onChange={() => {
                                form.setValue("familyMedicalHistory", "None");
                                setShowFamilyOtherField(false);
                              }}
                            />
                            <div className={`w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center ${isNoneSelected ? "bg-black" : ""}`} />
                            None
                          </label>

                          {/* Family Medical History Options */}
                          {familyMedicalHistories.map((history) => (
                            <label key={history} htmlFor={history} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={history}
                                className="peer hidden"
                                checked={selectedArray.includes(history)}
                                onChange={(e) => {
                                  let updatedSelection;

                                  if (e.target.checked) {
                                    updatedSelection = [...selectedArray.filter(item => item !== "None" && item !== "Others"), history];
                                    setShowFamilyOtherField(false);
                                  } else {
                                    updatedSelection = selectedArray.filter(item => item !== history);
                                  }

                                  form.setValue("familyMedicalHistory", updatedSelection.length ? updatedSelection.join(",") : "");
                                }}
                              />
                              <div className={`w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center ${selectedArray.includes(history) ? "bg-black" : ""}`} />
                              {history}
                            </label>
                          ))}

                          {/* Others Option */}
                          <label htmlFor="Others" className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              id="Others"
                              className="peer hidden"
                              checked={isOthersSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  form.setValue("familyMedicalHistory", "Others");
                                  form.setValue("familyMedicalHistory", ""); // Clear the textarea when selecting "Others"
                                  setShowFamilyOtherField(true);
                                } else {
                                  form.setValue("familyMedicalHistory", "");
                                  setShowFamilyOtherField(false);
                                }
                              }}
                            />
                            <div className={`w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center ${isOthersSelected ? "bg-black" : ""}`} />
                            Others
                          </label>
                        </div>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  {/* Show Textarea if "Others" is selected */}
                  {showFamilyOtherField && (
                    <CustomFormField
                      fieldType={FormFieldType.TEXTAREA}
                      control={form.control}
                      name="familyMedicalHistory"
                      label="Specify Family Medical History"
                      placeholder="Please specify..."
                      renderSkeleton={() => (
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded"
                          {...form.register("familyMedicalHistory")}
                          placeholder="Please specify..."
                        />
                      )}
                    />
                  )}
                </div>
              );
            }}
          />




      </div>

      <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header text-blue-700">Identification and Verification</h2>
          </div>
      </section>
       
      <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="identificationType"
            label="Identification Type"

            placeholder="Select identification type"
          required={true}
            >
                {IdentificationTypes.map((type) => (
            <SelectItem className="hover:bg-blue-100" key={type} value={type}>
                    {type}

                    </SelectItem>
                ))}
                
        </CustomFormField>
        <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="identificationNumber"
            label="Identification Number"
            placeholder="1234556789"
          required={true}
                    
          />
        <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="identificationDocument"
                label="Scanned copy of identification document"
          renderSkeleton={({ value, onChange }) => {
            const hasError = !value || value.length === 0;

            return (
              <div className={`p-2 border rounded-md ${hasError ? "border-red-500" : "border-green-500"}`}>
                <FormControl>
                  <FileUploader
                    files={value}
                    onChange={(files) => {
                      onChange(files); // Update form state
                      form.trigger("identificationDocument"); // Force validation update
                    }}
                  />
                    </FormControl>
              </div>
            );
          }}
            />

       <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header text-blue-700">Consent and Privacy</h2>
          </div>
      </section>

      <div className="text-black space-y-9">
      <CustomFormField
        fieldType={FormFieldType.CHECKBOX}
        control={form.control}
        name="treatmentConsent"
        label="I consent to treatment"
        backgroundColor="none"
            required={true}
      />
      
      
        <CustomFormField
        fieldType={FormFieldType.CHECKBOX}
        control={form.control}
        name="disclosureConsent"
        label="I consent to disclosure of information"
        backgroundColor="none"
            required={true}
      />
        <CustomFormField
        fieldType={FormFieldType.CHECKBOX}
        control={form.control}
        name="privacyConsent"
        label="I consent to privacy policy"
        backgroundColor="none"
            required={true}
      />
      </div>
      <SubmitButton isLoading={isLoading}> Submit</SubmitButton>
      
    </form>
  </Form>
  )
}

export default RegisterForm


