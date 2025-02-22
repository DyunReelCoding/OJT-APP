"use client";
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl} from "@/components/ui/form"
import CustomFormField from "../ui/CustomFormField"
import { useState } from "react"
import SubmitButton from "../SubmitButton"
import { PatientFormValidation, UserFormValidation } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { createUser, registerPatient } from "@/lib/actions/patient.actions"
import { FormFieldType } from "./PatientForms";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants";
import { RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Image from "next/image";
import FileUploader from "../FileUploader";
import { useEffect } from "react";
import SuccessMessage from "../SuccessMessage";
import { Client, Databases } from "appwrite";

// Load environment variables
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID!;
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_ALLERGIES_COLLECTION_ID!;
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT!;
const MEDICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_CURRENTMEDICATION_COLLECTION_ID!;
const OCCUPATION_COLLECTION_ID = process.env.NEXT_PUBLIC_OCCUPATIONTYPE_COLLECTION_ID!;
const OFFICETYPE_COLLECTION_ID = process.env.NEXT_PUBLIC_OFFICETYPE_COLLECTION_ID!;

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

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      email: "",
      phone: "",
      weight: "",
      height: "",
      bmi: "", 
      bmiCategory: "",
      occupation: "",
    },
  });

  // Watch the occupation field and normalize input
  const occupation = form.watch("occupation", "").toLowerCase().replace(/\s+$/, "");
  const isStudent = occupation === "student";
  const isEmployee = occupation === "employee";

  // Automatically set program and yearLevel to "None" if not a student
  useEffect(() => {
    if (isStudent) {
      form.setValue("program", ""); // Clear program field
      form.setValue("yearLevel", ""); // Clear yearLevel field
      form.setValue("office", "None"); // Set office to "None" if student
    } else if (isEmployee) {
      form.setValue("program", "None"); // Hide program
      form.setValue("yearLevel", "None"); // Hide yearLevel
      form.setValue("office", ""); // Clear office field
    } else {
      form.setValue("program", "None"); // Default for non-students
      form.setValue("yearLevel", "None"); // Default for non-students
      form.setValue("office", ""); // Clear office field
    }
  }, [isStudent, isEmployee, form]);

  useEffect(() => {
    const client = new Client();
    client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
    const databases = new Databases(client);

    const fetchAllergies = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        const allergyNames = response.documents.map((doc) => doc.name);
        setAllergies(["None", ...allergyNames]);
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
        const occupationList = response.documents.map((doc) => doc.name);
        setOccupations(occupationList);
      } catch (error) {
        console.error("Error fetching occupations:", error);
      }
    };
    
    fetchAllergies();
    fetchMedications();
    fetchOccupations();

    // Fetch office types from the database
    const fetchOfficeTypes = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, OFFICETYPE_COLLECTION_ID);
        const officeList = response.documents.map((doc) => doc.name);
        setOfficeTypes(officeList);
      } catch (error) {
        console.error("Error fetching office types:", error);
      }
    };
  
    fetchOfficeTypes();

  }, []);

  // BMI Calculation Logic
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
        if (bmiValue < 18.5) bmiCategory = "Underweight";
        else if (bmiValue < 24.9) bmiCategory = "Normal weight";
        else if (bmiValue < 29.9) bmiCategory = "Overweight";
        else bmiCategory = "Obese";
      } else if (age >= 18 && age <= 34) {
        if (bmiValue < 18.5) bmiCategory = "Underweight";
        else if (bmiValue < 24.9) bmiCategory = "Normal weight";
        else if (bmiValue < 29.9) bmiCategory = "Overweight";
        else bmiCategory = "Obese";
      } else {
        if (bmiValue < 18.5) bmiCategory = "Underweight";
        else if (bmiValue < 24.9) bmiCategory = "Normal weight";
        else if (bmiValue < 30) bmiCategory = "Overweight";
        else bmiCategory = "Obese";
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
        
        // Check occupation and redirect accordingly
        const occupation = values.occupation.toLowerCase();
        if (occupation === "student") {
          router.push(`/patients/${patient.$id}/student`);
        } else if (occupation === "employee") {
          router.push(`/patients/${patient.$id}/employee`);
        } else {
          router.push('/'); // Default redirect
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
          
        />
        <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="age"
            label="Age"
            placeholder="21"
            backgroundColor="bg-gray-50"
            
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
        />
        <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="091234567"
        />
      </div>
      <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="birthDate"
                label="Date of Birth"
                backgroundColor="bg-gray-50"
            />
        <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="gender"
                label="Gender"
                backgroundColor="bg-gray-50"
                renderSkeleton={(field)=>(
                    <FormControl>
                        <RadioGroup className="flex flex-11 gap-6 xl:justify-between text-black" 
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                            {GenderOptions.map((option) => (
                                <div key={option} className="radio-group">
                                    <RadioGroupItem value = {option} id={option}/>
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
                
            />
       <CustomFormField
  fieldType={FormFieldType.SKELETON}
  control={form.control}
  name="occupation"
  label="Occupation"
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
          <SelectContent className="bg-gray-800 text-white border-gray-600">
            {occupations.map((occupation) => (
              <SelectItem key={occupation} value={occupation}>
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
          
        />
        <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="religion"
            label="Religion"
            placeholder="Roman Catholic"
            
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
      />

      {/* Height Field */}
      <CustomFormField
        fieldType={FormFieldType.INPUT}
        control={form.control}
        name="height"
        label="Height (m)"
        placeholder="1.75"
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
          disabled={true} // Make it readonly since it's calculated automatically
        />

      {/* Add BMI category field */}
      <CustomFormField
        fieldType={FormFieldType.INPUT}
        control={form.control}
        name="bmiCategory"
        label="BMI Category"
        placeholder="Normal weight"
        disabled={true} // Disable it since it's auto-calculated
      />

</div>

{isStudent && (
        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="program"
            label="Program"
            placeholder="Bachelor of Science in Information Technology"
          />
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="yearLevel"
            label="Year Level"
            placeholder="4"
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
              <SelectContent className="bg-gray-800 text-white border-gray-600">
                {/* Check if officeTypes has data before rendering the dropdown */}
                {officeTypes.length > 0 ? (
                  officeTypes.map((officeType, index) => (
                    <SelectItem key={index} value={officeType}>
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
            />
            <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="emergencyContactNumber"
                label="Emergency contact number"
                placeholder="091234567"
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
          <SelectContent className="bg-gray-800 text-white border-gray-600">
            {allergies.map((allergy) => (
              <SelectItem key={allergy} value={allergy}>
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
          <SelectContent className="bg-gray-800 text-white border-gray-600">
            <SelectItem key="None" value="None">
              None
            </SelectItem>
            {medications.map((medication) => (
              <SelectItem key={medication} value={medication}>
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
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="familyMedicalHistory"
            label="Family medical history"
            placeholder="Mother had caugh disease"
                    
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="pastMedicalHistory"
            label="Past medical history"
            placeholder="Appendectomy"
          
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
            >
                {IdentificationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
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
                    
          />
        <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="identificationDocument"
                label="Scanned copy of identification document"
                renderSkeleton={(field)=>(
                    <FormControl>
                      <FileUploader files = {field.value} onChange={field.onChange}/>
                      
                    </FormControl>
                )}
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
      />
      
      
        <CustomFormField
        fieldType={FormFieldType.CHECKBOX}
        control={form.control}
        name="disclosureConsent"
        label="I consent to disclosure of information"
        backgroundColor="none"
      />
        <CustomFormField
        fieldType={FormFieldType.CHECKBOX}
        control={form.control}
        name="privacyConsent"
        label="I consent to privacy policy"
        backgroundColor="none"
      />
      </div>
      <SubmitButton isLoading={isLoading}> Submit</SubmitButton>
      
    </form>
  </Form>
  )
}

export default RegisterForm


