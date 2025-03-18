import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";

export default function MedicalClearanceForm() {
  const [formData, setFormData] = useState({
    date:'',
    name: '',
    age: '',
    civilStatus: '',
    resident: '',
    purpose: '',
    schedule: '',
    destination: '',
    bp: '',
    pr: '',
    height: '',
    weight: '',
    asthma: false,
    heartDisease: false,
    otherConditions: '',
    convulsions: false,
    allergy: false,
    normalExam: false,
    limitedParticipation: '',
    light: false,
    moderate: false,
    notFit: '',
    recommendations: '',
  });

  const handleChange = (e: { target: any }) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value, // Prevent boolean assignment to text fields
    }));
  };

const generatePDF = () => {
  const doc = new jsPDF();

  // Load image from public folder
  const imagePath = "/assets/images/university_clinic.png"; 
  const img = new Image();
  img.src = imagePath;

  img.onload = () => {
      doc.addImage(img, "PNG", 7, 5, 199, 31); // Adjust X, Y, Width, Height

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("MEDICAL CLEARANCE", 85, 45);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Date: ${formData.date}`, 165, 50);
      doc.text("__________", 175, 50);

      doc.text(`This is to certify that I have seen and examined Mr/Ms. ${formData.name},`, 15, 70);
      doc.text("_____________________________________.", 109, 70);
      doc.text(`${formData.age} years old, (${formData.civilStatus}), and a resident of ${formData.resident}`, 15, 77);
      doc.text("__                  _______                           _________________________________________________.", 15, 77.3);

      // Table Data
      const tableData = [
        ["Purpose:", formData.purpose],
        ["Schedule:", formData.schedule],
        ["Destination:", formData.destination]
      ];

      // Table Options
      autoTable(doc, {
        body: tableData, // Table content
        startY: 81, // Positioning (adjustable)
        theme: "grid", // Table styling ("striped", "grid", or "plain")
        styles: {
            halign: "left", // Align text to the left
            valign: "middle",
            fontSize: 10,
            lineColor: "black"
        },
        columnStyles: {
          0: { cellWidth: 30, textColor: "black" }, // "Field" column width = 50
          1: { cellWidth: 150, textColor: "black" } // "Details" column width = 100
        }
      });

      doc.setFont("Helvetica", "bold");
      doc.text("With the following Vital Signs:", 15, 113.5);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      const tableData2 = [
        [`BP:`, formData.bp],
        [`PR:`, formData.pr],
        [`Height:`, formData.height],
        [`Weight:`, formData.weight]
      ];

      // Table Options
      autoTable(doc, {
        body: tableData2, // Table content
        startY: 115, // Positioning (adjustable)
        theme: "grid", // Table styling ("striped", "grid", or "plain")
        styles: {
            halign: "left", // Align text to the left
            valign: "middle",
            fontSize: 10,
            lineColor: "black"
        },
        columnStyles: {
          0: { cellWidth: 30, textColor: "black" }, // "Field" column width = 50
          1: { cellWidth: 150, textColor: "black" } // "Details" column width = 100
        }
      });
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Health History:", 15, 156);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.rect(18, 158, 7, 7); 
      doc.text("Asthma", 27, 163);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.asthma ? "4" : ""}`, 20, 163);
      doc.rect(18, 168, 7, 7);
      doc.setFont("Helvetica");
      doc.text("Hearth Disease", 27, 173);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.heartDisease ? "4" : ""}`, 20, 173);
      doc.rect(18, 178, 7, 7);
      doc.setFont("Helvetica");
      doc.text("Other Conditions:", 27, 183);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.otherConditions ? "4" : ""}`, 20, 183);
      doc.setFont("Helvetica");
      doc.text(`${formData.otherConditions}`, 56, 183);
      doc.text("_________________________.",55,183);
      doc.rect(68, 158, 7, 7); 
      doc.setFont("Helvetica");
      doc.text("Convulsions/Neurologic Problems:", 77, 163);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.convulsions ? "4" : ""}`, 70, 163);

      doc.rect(68, 168, 7, 7); 
      doc.setFont("Helvetica");
      doc.text("Allergy", 77, 173);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.allergy ? "4" : ""}`, 70, 173);

      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Assessment:", 15, 193);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.setFont("Helvetica");
      doc.rect(18, 195, 7, 7); 
      doc.setFont("Helvetica");
      doc.text("Essentially Normal Physical Examination Findings on Time of Examination", 27, 200);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.normalExam ? "4" : ""}`, 20, 200);

      doc.rect(18, 205, 7, 7); 
      doc.setFont("Helvetica");
      doc.text("Can participate but with limitation:", 27, 210);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.limitedParticipation ? "4" : ""}`, 20, 210);
      doc.setFont("Helvetica");
      doc.text(`${formData.limitedParticipation}`, 81, 210);
      doc.text("_____________________________________________.", 80, 210);
      doc.setFont("Helvetica");
      doc.text("Level of Activity:", 27, 218);
      doc.rect(60, 213, 7, 7); 
      doc.text("Light", 69, 218);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.light ? "4" : ""}`, 62, 218);
      doc.setFont("Helvetica");
      doc.rect(85, 213, 7, 7); 
      doc.text("Moderate", 94, 218);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.moderate ? "4" : ""}`, 87, 218);


      doc.setFont("Helvetica");
      doc.rect(18, 222, 7, 7); 
      doc.text("Not fit to participate:", 27, 227);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.notFit ? "4" : ""}`, 20, 227);
      doc.setFont("Helvetica");
      doc.text(`${formData.notFit||" "}`, 60, 227);
      doc.text("_____________________________________________.", 58.5, 227);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Recommendations:", 15, 236);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      const maxWidth = 175; // Adjust width based on page layout
      const wrappedText = doc.splitTextToSize(`${formData.recommendations}`, maxWidth);
      const wrappedText2 = doc.splitTextToSize("________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________", maxWidth);
      doc.text(wrappedText, 15, 243);
      doc.text(wrappedText2, 15, 243);

      doc.text("F-HAW-003",15,280);
      doc.text("Rev 2. 01-17.2024",15,285);
      doc.text("____________________________",130 , 268);
      doc.text("University Physician / Nurse",136,273);
      doc.text("Lic.No;______________",140,278);
      doc.save("Medical_Clearance.pdf");
  };

  img.onerror = () => {
      console.error("Failed to load image:", imagePath);
  };
};


  return (
    <div className="p-6 space-y-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-700">Medical Clearance Form</h2>
      <Input
        type="date"
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="date"
        placeholder="Date"
        onChange={handleChange}
      />

      <Input
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="age"
        placeholder="Age"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="civilStatus"
        placeholder="Civil Status"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="resident"
        placeholder="Resident Address"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="purpose"
        placeholder="Purpose"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="schedule"
        placeholder="Schedule"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="destination"
        placeholder="Destination"
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input className="bg-white text-black border-blue-700" name="bp" placeholder="BP" onChange={handleChange} />
        <Input className="bg-white text-black border-blue-700" name="pr" placeholder="PR" onChange={handleChange} />
        <Input className="bg-white text-black border-blue-700" name="height" placeholder="Height" onChange={handleChange} />
        <Input className="bg-white text-black border-blue-700" name="weight" placeholder="Weight" onChange={handleChange} />
      </div>

      <div className="space-y-2">
  <h3 className="font-semibold text-black">Health History:</h3>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="asthma"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'asthma', type: 'checkbox', checked } })
      }
    />
    Asthma
  </label>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="heartDisease"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'heartDisease', type: 'checkbox', checked } })
      }
    />
    Heart Disease
  </label>
 
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="convulsions"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'convulsions', type: 'checkbox', checked } })
      }
    />
    Convulsions/Neurologic Problems
  </label>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="allergy"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'allergy', type: 'checkbox', checked } })
      }
    />
    Allergy
  </label>
  <Input
    name="otherConditions"
    placeholder="Other Conditions; Specify"
    className="bg-white text-black border-blue-700"
    onChange={handleChange}
  />

  <h3 className="font-semibold mt-4 text-black">Level of Activity:</h3>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="normalExam"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'normalExam', type: 'checkbox', checked } })
      }
    />
    Essentially Normal Physical Examination findings on time of Examination
  </label>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="limitedParticipation"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'limitedParticipation', type: 'checkbox', checked } })
      }
    />
    Can participate but with limitation:
  </label>
  <Input
    name="limitedParticipation"
    placeholder="Reason"
    className="bg-white text-black border-blue-700"
    onChange={handleChange}
  />
  <label className="ml-6 flex items-center gap-2 text-black">
    <Checkbox
      name="light"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'light', type: 'checkbox', checked } })
      }
    />
    Light
  </label>
  <label className="ml-6 flex items-center gap-2 text-black">
    <Checkbox
      name="moderate"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'moderate', type: 'checkbox', checked } })
      }
    />
    Moderate
  </label>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="notFit"
      className="bg-white border-blue-700 checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'notFit', type: 'checkbox', checked } })
      }
    />
    Not fit to participate:
  </label>
  <Input
    name="notFit"
    placeholder="Reason"
    className="bg-white text-black border-blue-700"
    onChange={handleChange}
  />
</div>


      <Textarea
        className="bg-white text-black placeholder-gray-500 border border-blue-700"
        name="recommendations"
        placeholder="Recommendations"
        onChange={handleChange}
      />

      <Button className="font-bold bg-red-700 text-white hover:text-red-700 hover:bg-white border-2 border-red-700" onClick={generatePDF}>
        Generate PDF
      </Button>
    </div>
  );
}
