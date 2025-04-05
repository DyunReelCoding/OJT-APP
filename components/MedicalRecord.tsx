import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import autoTable from 'jspdf-autotable';


export default function MedicalRecord({ patientName = "", 
  patientAge = "", 
  patientAddress = "",
  patientGender = "",
  patientContactNumber = "",
  office = ""  }) {
  const [formData, setFormData] = useState({
    name: patientName,
    address: patientAddress,
    age: patientAge,
    sex: patientGender,
    contact: patientContactNumber,
    office: office,
    bp: '',
    pr: '',
    rr: '',
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
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
  
    const formattedDate = selectedDate
      ? selectedDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      : 'N/A';

    const imagePath = "/assets/images/university_clinic.png"; 
    const img = new Image();
    img.src = imagePath;
  
    img.onload = () => {
      doc.addImage(img, "PNG", 7, 5, 199, 31);

      doc.text('MEDICAL RECORD FORM', 80, 50);
      doc.setFont('Helvetica', 'normal');
      // doc.text(`Date: ${formattedDate}`, 140, 50);
    
      const tableData1 = [
        [
          { content: `Name: ${formData.name}`, colSpan: 1 }, 
          { content: `Age: ${formData.age}`, colSpan: 1 }, 
          { content: `Sex: ${formData.sex}`, colSpan: 1 }
        ],
        [
          { content: `Home Address: ${formData.address}`, colSpan: 3 } // Merging across 3 columns
        ],
        [
          {content: `BP: ${formData.bp}   RR: ${formData.rr}        Temp: ${formData.temp}°C\n\nPR: ${formData.pr}    O2 Sat: ${formData.sat}`},
          {content: `Contact No.: ${formData.contact}\n\nOffice/College/Unit: ${formData.office}`,colSpan: 3}
        ],
        [
          {content: `Allergies: YES \t\tNO \t\t\t\t\t FOOD: \t\t\t\tDRUGS: `, colSpan:3}
        ]
      ];

      autoTable(doc, {
        body: tableData1, // Table content
        startY: 60, // Positioning (adjustable)
        theme: "grid", // Table styling ("striped", "grid", or "plain")
        styles: {
            halign: "left", // Align text to the left
            valign: "middle",
            fontSize: 10,
            lineColor: "black"
        },
        columnStyles: {
          0: { cellWidth: 111, textColor: "black" }, // "Field" column width = 50
          1: { cellWidth: 35, textColor: "black" },
          2: {cellWidth: 35, textColor: "black"},
          3: {cellWidth: 181, textColor: "black"},
          4: {cellWidth: 70, textColor: "black"},
          5: {cellWidth: 40, textColor: "black"} // "Details" column width = 100
        }
      });

      const tableData2 = [
        ["Data/Time", "Complaint and Assessment", "Diagnosis and Treatment"],
        [formattedDate, "", ""]
      ];

      autoTable(doc, {
        body: tableData2, // Table content
        startY: 105, // Positioning (adjustable)
        theme: "grid", // Table styling ("striped", "grid", or "plain")
        styles: {
            halign: "center", // Align text to the left
            valign: "middle",
            fontSize: 10,
            lineColor: "black"
        },
        columnStyles: {
          0: { cellWidth: 60.33, textColor: "black" }, // "Field" column width = 50
          1: { cellWidth: 60.33, textColor: "black", halign: "center" },
          2: {cellWidth: 60.33, textColor: "black", halign: "justify"}
        },
        didParseCell: function (data) {
          // Apply increased height ONLY to the last row (index 1 in this case)
          if (data.section === 'body' && data.row.index === 1) {
            data.cell.styles.minCellHeight = 126; // You can adjust the value here
          }
        }
        
      });

      doc.text("______       _____         ________",22,80);
      doc.text("____            _____",22,87.8);
      doc.text("_____________",113,96);
      doc.text("______________",159,96);
      doc.text("____________________",147,80);
      doc.text("_______________",157,88);
      doc.rect(42, 92, 5, 5);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.allergies ? "4" : ""}`,43,96);
      doc.rect(63.5, 92, 5, 5);
      doc.text(`${formData.allergies ? "" : "4"}`,64.5,96); 
      if (formData.allergies) {
        doc.setFont("Helvetica");
        doc.text(`${formData.food || 'N/A'}`, 114, 96);
        doc.text(`${formData.drugs || 'N/A'}`, 160, 96);
      }
    
      doc.setFont("Helvetica");
      doc.setFontSize(10);
      doc.text("F-HAW-004",15,275);
      doc.text("Rev 0. 08-10.2023",15,280);
      doc.text("Seen and Examined by:", 90, 248);
      doc.text("____________________________",130 , 252);
      doc.text("University Physician / Nurse",136,257);
      doc.text("Lic.No;______________",140,262);
      doc.save('Medical_Record.pdf');
      };
      img.onerror = () => {
        console.error("Failed to load image:", imagePath);
      };
    
  };
  
  return (
   <div className="p-6 space-y-4 bg-white shadow-lg rounded-lg">
  <h2 className="text-2xl font-semibold text-blue-700">Medical Record Form</h2>

  <Input
    name="name"
    placeholder="Full Name"
    className="bg-white text-black border border-blue-700"
    value={formData.name}
    onChange={handleChange}
  />
  <Input
    name="address"
    placeholder="Home Address"
    className="bg-white text-black border border-blue-700"
    value={formData.address}
    onChange={handleChange}
  />
  <Input
    name="age"
    placeholder="Age"
    className="bg-white text-black border border-blue-700"
    value={formData.age}
    onChange={handleChange}
  />
  <Input
    name="sex"
    placeholder="Sex"
    className="bg-white text-black border border-blue-700"
    value={formData.sex}
    onChange={handleChange}
  />
  <Input
    name="contact"
    placeholder="Contact No."
    className="bg-white text-black border border-blue-700"
    value={formData.contact}
    onChange={handleChange}
  />
  <Input
    name="office"
    placeholder="Office/College/Unit"
    className="bg-white text-black border border-blue-700"
    value={formData.office}
    onChange={handleChange}
  />

  <h3 className="font-semibold text-black">Vital Signs:</h3>
  <Input
    name="bp"
    placeholder="BP"
    className="bg-white text-black border border-blue-700"
    onChange={handleChange}
  />
  <Input
    name="rr"
    placeholder="RR"
    className="bg-white text-black border border-blue-700"
    onChange={handleChange}
  />
  <Input
    name="pr"
    placeholder="PR"
    className="bg-white text-black border border-blue-700"
    onChange={handleChange}
  />
  <Input
    name="temp"
    placeholder="Temperature"
    className="bg-white text-black border border-blue-700"
    onChange={handleChange}
  />
  <Input
    name="sat"
    placeholder="O2 Saturation"
    className="bg-white text-black border border-blue-700"
    onChange={handleChange}
  />

<h3 className="font-semibold text-black">Allergies:</h3>
<div className="flex items-center gap-4">
  <label className="text-black flex items-center gap-2">
    <Checkbox
    className='border-blue-700'
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
    className='border-blue-700'
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
        className="bg-white text-black border border-blue-700"
        value={formData.food}
        onChange={handleChange}
      />
    </div>

    <div className="flex items-center gap-2">
      <span className="text-black">Drugs:</span>
      <Input
        name="drugs"
        placeholder="Specify drug allergy"
        className="bg-white text-black border border-blue-700"
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
  className="bg-white text-black border border-blue-700 p-2 rounded-md"
/>

<Button className="flex font-bold bg-red-700 text-white hover:text-red-700 hover:bg-white border-2 border-red-700" onClick={generatePDF}>
        Generate PDF
      </Button>
    </div>
  );
}