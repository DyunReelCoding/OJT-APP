import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export default function MedicalRecord() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    age: '',
    sex: '',
    contact: '',
    office: '',
    bp: '',
    pr: '',
    temp: '',
    sat: '',
    allergies: false,
    food: '',
    drugs: '',
    complaint: '',
    diagnosis: '',
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleChange = (e: { target: any }) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', '');
    doc.setFontSize(12);
  
    const formattedDate = selectedDate
      ? selectedDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      : 'N/A';
  
    doc.text('Republic of the Philippines', 20, 20);
    doc.text('CARAGA STATE UNIVERSITY', 20, 30);
    doc.text('UNIVERSITY CENTER FOR HEALTH AND WELLNESS', 20, 40);
    doc.text('MEDICAL RECORD FORM', 20, 50);
    doc.text(`Date: ${formattedDate}`, 140, 50);
  
    doc.text(`Name: ${formData.name || 'N/A'}`, 20, 70);
    doc.text(`Home Address: ${formData.address || 'N/A'}`, 20, 80);
    doc.text(`Age: ${formData.age || 'N/A'}`, 20, 90);
    doc.text(`Sex: ${formData.sex || 'N/A'}`, 20, 100);
    doc.text(`Contact No: ${formData.contact || 'N/A'}`, 20, 110);
    doc.text(`Office/College/Unit: ${formData.office || 'N/A'}`, 20, 120);
  
    doc.text(`BP: ${formData.bp || 'N/A'}`, 20, 140);
    doc.text(`PR: ${formData.pr || 'N/A'}`, 20, 150);
    doc.text(`Temp: ${formData.temp || 'N/A'}`, 20, 160);
    doc.text(`O2 Sat: ${formData.sat || 'N/A'}`, 20, 170);
  
    doc.text(`Allergies: ${formData.allergies ? 'YES' : 'NO'}`, 20, 190);
    if (formData.allergies) {
      doc.text(`Food: ${formData.food || 'N/A'}`, 20, 200);
      doc.text(`Drugs: ${formData.drugs || 'N/A'}`, 20, 210);
    }
  
    doc.text(`Complaint and Assessment: ${formData.complaint || 'N/A'}`, 20, 230);
    doc.text(`Diagnosis and Treatment: ${formData.diagnosis || 'N/A'}`, 20, 240);
  
    doc.save('Medical_Record.pdf');
  };
  
  return (
   <div className="p-6 space-y-4 bg-white shadow-lg rounded-lg">
  <h2 className="text-2xl font-semibold text-black">Medical Record Form</h2>

  <Input
    name="name"
    placeholder="Full Name"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Input
    name="address"
    placeholder="Home Address"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Input
    name="age"
    placeholder="Age"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Input
    name="sex"
    placeholder="Sex"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Input
    name="contact"
    placeholder="Contact No."
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Input
    name="office"
    placeholder="Office/College/Unit"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />

  <h3 className="font-semibold text-black">Vital Signs:</h3>
  <Input
    name="bp"
    placeholder="BP"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Input
    name="pr"
    placeholder="PR"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Input
    name="temp"
    placeholder="Temperature"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Input
    name="sat"
    placeholder="O2 Saturation"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />

<h3 className="font-semibold text-black">Allergies:</h3>
<div className="flex items-center gap-4">
  <label className="text-black flex items-center gap-2">
    <Checkbox
      name="allergies"
      checked={formData.allergies}
      onCheckedChange={(checked) =>
        setFormData({
          ...formData,
          allergies: !!checked,
          food: '',
          drugs: '',
        })
      }
    />
    YES
  </label>
  <label className="text-black flex items-center gap-2">
    <Checkbox
      name="allergies"
      checked={!formData.allergies}
      onCheckedChange={(checked) =>
        setFormData({
          ...formData,
          allergies: !checked,
          food: '',
          drugs: '',
        })
      }
    />
    NO
  </label>
</div>

{formData.allergies && (
  <>
    <div className="flex items-center gap-2">
      <span className="text-black">Food:</span>
      <Input
        name="food"
        placeholder="Specify food allergy"
        className="bg-white text-black border border-gray-300"
        value={formData.food}
        onChange={handleChange}
      />
    </div>

    <div className="flex items-center gap-2">
      <span className="text-black">Drugs:</span>
      <Input
        name="drugs"
        placeholder="Specify drug allergy"
        className="bg-white text-black border border-gray-300"
        value={formData.drugs}
        onChange={handleChange}
      />
    </div>
  </>
)}

<DatePicker
  selected={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  showTimeSelect
  dateFormat="Pp"
  className="bg-white text-black border border-gray-300 p-2 rounded-md"
/>


  <Textarea
    name="complaint"
    placeholder="Complaint and Assessment"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />
  <Textarea
    name="diagnosis"
    placeholder="Diagnosis and Treatment"
    className="bg-white text-black border border-gray-300"
    onChange={handleChange}
  />

<Button className="bg-black text-white hover:bg-gray-800" onClick={generatePDF}>
        Generate PDF
      </Button>
    </div>
  );
}