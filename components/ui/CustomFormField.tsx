'use client'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { FormFieldType } from "../forms/PatientForms"
import Image from "next/image"
import { FormInput } from "lucide-react"
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { E164Number } from 'libphonenumber-js';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./select"
import { Textarea } from "./textarea"
import { Checkbox } from "./checkbox"




interface CustomProps {
    control: Control<any>;
    name: string;
    label?: string;
    placeholder?: string;
    iconSrc?: string;
    iconAlt?: string;
    disabled?: boolean;
    dateFormat?: string;
    showTimeSelect?: boolean;
    children?: React.ReactNode;
    renderSkeleton?: (field: any) => React.ReactNode;
    fieldType: FormFieldType;
    backgroundColor?: string;
    radioOptionBackground?: string;
}

const RenderField = ({field, props}: {field:any; props:CustomProps}) => {
  const {fieldType, iconSrc, iconAlt, placeholder,showTimeSelect,dateFormat,renderSkeleton, backgroundColor = 'bg-gray-50', radioOptionBackground = 'bg-gray-100'} = props;

 switch (fieldType){
  case FormFieldType.INPUT:
    return (
      <div className={`flex rounded-md border ${backgroundColor} text-black`}>
        {iconSrc && (
          <Image 
           src={iconSrc}
           height={24}
           width="24"
           alt={iconAlt || 'icon' }
           className = "ml-2"
          />

        )}
        
        <FormControl>
          <Input
          placeholder={placeholder}
          {...field}
          className="shad-input border-0"
          />

        </FormControl>


      </div>
    )
  case FormFieldType.TEXTAREA:
    return (
      <FormControl>
        <div className={`${backgroundColor} rounded-md text-black`}>
          <Textarea 
          placeholder={placeholder}
          {...field}
          className="shad-textArea"
          disabled={props.disabled}
          />
        </div>
        

      </FormControl>
    )
  case FormFieldType.PHONE_INPUT:
    return (
      <FormControl>
        <div className={`text-black ${backgroundColor}`}>
          <PhoneInput
            defaultCountry="PH"
            placeholder={placeholder}
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}  
            onChange={field.onChange}
            className="input-phone"
          />
        </div>
      </FormControl>
    )
    case FormFieldType.DATE_PICKER:
      return (
        <div className={`flex rounded-md border ${backgroundColor} text-black`}>
          <Image
            src="/assets/icons/calendar.svg"
            height={24}
            width={24}
            alt="calendar"
            className="ml-2"
          />
          <FormControl>
            <DatePicker
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              dateFormat={dateFormat ?? 'MM/dd/yyyy'}
              showTimeSelect={showTimeSelect ?? false}
              timeInputLabel="Time:"
              wrapperClassName="date-picker"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              yearDropdownItemNumber={100}
              scrollableYearDropdown
            />
          </FormControl>
        </div>
      );
    
    case FormFieldType.SELECT:
      return (
        <div className={`${backgroundColor} rounded-md border-dark-400`}>
          <FormControl>
          <Select onValueChange={field.onChange}
          defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="shad-select-trigger">
                <SelectValue placeholder={placeholder}/>
              </SelectTrigger>

            </FormControl>
            <SelectContent className="shad-select-content">
            {props.children}
            </SelectContent>
            
          </Select>
        </FormControl>
        </div>
        
      )
  case FormFieldType.SKELETON:
    return(
      <div>
        {renderSkeleton ? renderSkeleton(field) : null}
      </div>
    )
    case FormFieldType.CHECKBOX:
      return (
        <div className={`${backgroundColor}`}>
          <FormControl>
        <div className="flex items-center gap-4">
          <Checkbox 
          id={props.name}
          checked={field.value}
          onCheckedChange={field.onChange}
          className="border-gray-500"
          />

          <label htmlFor={props.name} className="checkbox-label">
            {props.label}

          </label>
        </div>
      </FormControl>
        </div>
      )
  default:
    break; 
 }
}



const CustomFormField = (props: CustomProps) => { 
  const {control, fieldType, name, label} = props;
  return (
    <FormField
    control={control}
    name={name}
    render={({ field }) => (
        <FormItem className="flex-1">
            {fieldType !== FormFieldType.CHECKBOX && label &&(
                <FormLabel>
                    {label}
                </FormLabel>
            )}

        <RenderField field={field} props={props} />
        <FormMessage className="shad-error"/>
        </FormItem>
    )}
    />
    
  )
}

export default CustomFormField
