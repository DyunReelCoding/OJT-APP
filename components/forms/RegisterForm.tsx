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
import { SelectItem } from "../ui/select";
import Image from "next/image";
import FileUploader from "../FileUploader";
import { useEffect } from "react";



const RegisterForm = ({user}: {user:User}) => {
  const router =  useRouter();
  const [isLoading, setIsLoding] = useState(false);
  
  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: "",
      email: "",
      phone: "",
      weight: "",
      height: "",
      bmi: "", 
      bmiCategory: "",
    },
  })
  useEffect(() => {
    const weightStr = form.watch("weight");
    const heightStr = form.watch("height");
    const ageStr = form.watch("age");
  
    // Convert strings to numbers safely
    const weight = Number(weightStr);
    const height = Number(heightStr);
    const age = Number(ageStr); // Convert age to a number
  
    if (!isNaN(weight) && !isNaN(height) && height > 0) {
      const bmiValue = (weight / (height * height)); // Calculate BMI as a number
      form.setValue("bmi", bmiValue.toString()); // Set BMI as string
  
      let bmiCategory = "";
  
      if (age < 18) {
        if (bmiValue < 18.5) bmiCategory = "Underweight";
        else if (bmiValue >= 18.5 && bmiValue < 24.9) bmiCategory = "Normal weight";
        else if (bmiValue >= 25 && bmiValue < 29.9) bmiCategory = "Overweight";
        else bmiCategory = "Obese";
      } else if (age >= 18 && age <= 34) {
        if (bmiValue < 18.5) bmiCategory = "Underweight";
        else if (bmiValue >= 18.5 && bmiValue < 24.9) bmiCategory = "Normal weight";
        else if (bmiValue >= 25 && bmiValue < 29.9) bmiCategory = "Overweight";
        else bmiCategory = "Obese";
      } else if (age >= 35) {
        if (bmiValue < 18.5) bmiCategory = "Underweight";
        else if (bmiValue >= 18.5 && bmiValue < 24.9) bmiCategory = "Normal weight";
        else if (bmiValue >= 25 && bmiValue < 30) bmiCategory = "Overweight";
        else bmiCategory = "Obese";
      }
  
      form.setValue("bmiCategory", bmiCategory); // Set BMI category field
    } else {
      form.setValue("bmi", ""); // Reset BMI if values are invalid
      form.setValue("bmiCategory", ""); // Reset BMI category if values are invalid
    }
  }, [form.watch("weight"), form.watch("height"), form.watch("age")]); 
  

  async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
    setIsLoding(true);
    
    let formData;

    if(values.identificationDocument && values.identificationDocument.length > 0){
      const blobFile = new Blob([values.identificationDocument[0]], {
        type: values.identificationDocument[0].type,
      })

      formData = new FormData();
      formData.append('blobFile', blobFile);
      formData.append('fileName', values.identificationDocument[0].name)

    }
    try{
      const patientData = {
        ...values,
        userId: user.$id,
        birthDate: new Date(values.birthDate),
        identificationDocument: formData,
       
      }

      // @ts-ignore
      const patient = await registerPatient(patientData);

      if(patient) router.push(`/patients/${user.$id}/success`)
    }catch (error) {
      console.log(error);
      
    } 
  }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} 
    className="space-y-12 flex-1">
      <section className="space-y-4">
        <h1 className="header">Welcome!👋</h1>
        <p className="text-dark-700">Let us know about yourself.</p>
      </section>

      <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Personal Information</h2>
          </div>
      </section>

      <CustomFormField
        fieldType={FormFieldType.INPUT}
        control={form.control}
        name="name"
        label="Full Name"
        placeholder="John Doe"
        iconSrc="/assets/icons/user.svg"
        iconAlt="user"
      />
       <div className="flex flex-col gap-6 xl:flex-row">
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="idNumber"
          label="ID number"
          placeholder="211-01338"
          
        />
        <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="age"
            label="Age"
            placeholder="21"
            
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
            iconAlt="email  "
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
            />
        <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="gender"
                label="Gender"
                renderSkeleton={(field)=>(
                    <FormControl>
                        <RadioGroup className="flex flex-11 gap-6 xl:justify-between" 
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
        fieldType={FormFieldType.INPUT}
        control={form.control}
        name="occupation"
        label="Occupation"
        placeholder="Software Engineer"
        
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
            <h2 className="sub-header">Medical Information</h2>
          </div>
      </section>
      <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="primaryPhysician"
            label="Primary Physician"
            placeholder="Select a physician"
            >
                {Doctors.map((doctor) => (
                    <SelectItem key={doctor.name} 
                    value={doctor.name}>
                        <div className="flex cursor-pointer items-center-gap-2 items-center ">
                            <Image
                                src={doctor.image}
                                width={32}
                                height={32}
                                alt ={doctor.name}
                                className="rounded-full border border-dark-500 mr-2"
                            />
                            <p>{doctor.name}</p>
                        </div>

                    </SelectItem>
                ))}
        </CustomFormField>
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
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="allergies"
            label="Allergies (if any)"
            placeholder="Peanut, Penicillin, Pollen"
                    
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="currentMedication"
            label="Current Medication (if any)"
            placeholder="Ibuprofen 200mg, Paracetamol 200mg"
          
          />
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
            <h2 className="sub-header">Identification and Verification</h2>
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
            <h2 className="sub-header">Consent and Privacy</h2>
          </div>
      </section>

      <CustomFormField
        fieldType={FormFieldType.CHECKBOX}
        control={form.control}
        name="treatmentConsent"
        label="I consent to treatment"
      />
        <CustomFormField
        fieldType={FormFieldType.CHECKBOX}
        control={form.control}
        name="disclosureConsent"
        label="I consent to disclosure of information"
      />
        <CustomFormField
        fieldType={FormFieldType.CHECKBOX}
        control={form.control}
        name="privacyConsent"
        label="I consent to privacy policy"
      />
      <SubmitButton isLoading={isLoading}> Get Started</SubmitButton>

    </form>
  </Form>
  )
}

export default RegisterForm


