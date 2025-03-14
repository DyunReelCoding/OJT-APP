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
  const getBase64 = (file: File, callback: (result: string | ArrayBuffer | null) => void): void => {
    const reader = new FileReader();
    
    reader.readAsDataURL(file);

    reader.onload = () => {
        callback(reader.result);
    };

    reader.onerror = (error) => {
        console.error("Error converting file to Base64:", error);
    };
};

const generatePDF = () => {
  const doc = new jsPDF();

  // Load image from public folder
  const imagePath = "/assets/images/university_clinic.png"; 
  const img = new Image();
  img.src = imagePath;

  img.onload = () => {
      doc.addImage(img, "PNG", 7, 5, 199, 31); // Adjust X, Y, Width, Height

      doc.setFont("Helvetica");
      doc.setFontSize(12);
      doc.text("MEDICAL CLEARANCE", 85, 45);
      doc.text(`Date: ${formData.date}`, 165, 50);
      doc.text("__________", 175, 50);
      doc.text(`This is to certify that I have seen and examined Mr/Ms. ${formData.name},`, 15, 70);
      doc.text("________________________________.", 118, 70);
      doc.text(`${formData.age} years old, (${formData.civilStatus}), and a resident of ${formData.resident}`, 15, 77);
      doc.text("__                 _______                             ___________________________________________.", 15, 77.3);

      // Table Data
      const tableData = [
        ["Purpose:", formData.purpose],
        ["Schedule:", formData.schedule],
        ["Destination:", formData.destination]
      ];

      // Table Options
      autoTable(doc, {
        body: tableData, // Table content
        startY: 83, // Positioning (adjustable)
        theme: "grid", // Table styling ("striped", "grid", or "plain")
        styles: {
            halign: "left", // Align text to the left
            valign: "middle",
            fontSize: 11,
            lineColor: "black"
        },
        columnStyles: {
          0: { cellWidth: 30, textColor: "black" }, // "Field" column width = 50
          1: { cellWidth: 150, textColor: "black" } // "Details" column width = 100
        }
      });

      doc.text("With the following Vital Signs:", 15, 115);

      const tableData2 = [
        [`BP:`, formData.bp],
        [`PR:`, formData.pr],
        [`Height:`, formData.height],
        [`Weight:`, formData.weight]
      ];

      // Table Options
      autoTable(doc, {
        body: tableData2, // Table content
        startY: 120, // Positioning (adjustable)
        theme: "grid", // Table styling ("striped", "grid", or "plain")
        styles: {
            halign: "left", // Align text to the left
            valign: "middle",
            fontSize: 11,
            lineColor: "black"
        },
        columnStyles: {
          0: { cellWidth: 30, textColor: "black" }, // "Field" column width = 50
          1: { cellWidth: 150, textColor: "black" } // "Details" column width = 100
        }
      });

      doc.text("Health History:", 15, 160);
      doc.rect(18, 165, 7, 7); 
      doc.text("Asthma", 27, 170);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.asthma ? "4" : ""}`, 20, 170);
      doc.rect(18, 175, 7, 7);
      doc.setFont("Helvetica");
      doc.text("Hearth Disease", 27, 180);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.heartDisease ? "4" : ""}`, 20, 180);
      doc.rect(18, 185, 7, 7);
      doc.setFont("Helvetica");
      doc.text("Other Conditions:", 27, 190);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.otherConditions ? "4" : ""}`, 20, 190);
      doc.setFont("Helvetica");
      doc.text(`${formData.otherConditions}`, 63, 190);
      doc.text("_________________________.",62.4,190);
      doc.rect(68, 165, 7, 7); 
      doc.setFont("Helvetica");
      doc.text("Convulsions/Neurologic Problems:", 77, 170);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.convulsions ? "4" : ""}`, 70, 170);

      doc.rect(68, 175, 7, 7); 
      doc.setFont("Helvetica");
      doc.text("Allergy", 77, 180);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.allergy ? "4" : ""}`, 70, 180);

      doc.setFont("Helvetica");
      doc.text("Assessment:", 15, 200);

      doc.rect(18, 205, 7, 7); 
      doc.setFont("Helvetica");
      doc.text("Essentially Normal Physical Examination Findings on Time of Examination", 27, 210);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.normalExam ? "4" : ""}`, 20, 210);

      doc.rect(18, 215, 7, 7); 
      doc.setFont("Helvetica");
      doc.text("Can participate but with limitation:", 27, 220);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.limitedParticipation ? "4" : ""}`, 20, 220);
      doc.setFont("Helvetica");
      doc.text(`${formData.limitedParticipation}`, 93, 220);
      doc.text("_____________________________________________.", 92, 220);
      doc.setFont("Helvetica");
      doc.text("Level of Activity:", 27, 228);
      doc.rect(60, 223, 7, 7); 
      doc.text("Light", 69, 228);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.light ? "4" : ""}`, 62, 228);
      doc.setFont("Helvetica");
      doc.rect(85, 223, 7, 7); 
      doc.text("Moderate", 94, 228);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.moderate ? "4" : ""}`, 87, 228);


      doc.setFont("Helvetica");
      doc.rect(18, 232, 7, 7); 
      doc.text("Not fit to participate:", 27, 237);
      doc.setFont("ZapfDingbats");
      doc.text(`${formData.notFit ? "4" : ""}`, 20, 237);
      doc.setFont("Helvetica");
      doc.text(`${formData.notFit||" "}`, 67, 237);
      doc.text("_____________________________________________.", 66, 237);

      doc.text("Recommendations:", 15, 247)
      const maxWidth = 175; // Adjust width based on page layout
      const wrappedText = doc.splitTextToSize(`${formData.recommendations}`, maxWidth);

      doc.text(wrappedText, 15, 253);

      doc.save("Medical_Clearance.pdf");
  };

  img.onerror = () => {
      console.error("Failed to load image:", imagePath);
  };
};


  return (
    <div className="p-6 space-y-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-black">Medical Clearance Form</h2>
      <Input
        type="date"
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="date"
        placeholder="Date"
        onChange={handleChange}
      />

      <Input
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="age"
        placeholder="Age"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="civilStatus"
        placeholder="Civil Status"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="resident"
        placeholder="Resident Address"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="purpose"
        placeholder="Purpose"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="schedule"
        placeholder="Schedule"
        onChange={handleChange}
      />
      <Input
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="destination"
        placeholder="Destination"
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input className="bg-white text-black" name="bp" placeholder="BP" onChange={handleChange} />
        <Input className="bg-white text-black " name="pr" placeholder="PR" onChange={handleChange} />
        <Input className="bg-white text-black" name="height" placeholder="Height" onChange={handleChange} />
        <Input className="bg-white text-black" name="weight" placeholder="Weight" onChange={handleChange} />
      </div>

      <div className="space-y-2">
  <h3 className="font-semibold text-black">Health History:</h3>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="asthma"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'asthma', type: 'checkbox', checked } })
      }
    />
    Asthma
  </label>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="heartDisease"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'heartDisease', type: 'checkbox', checked } })
      }
    />
    Heart Disease
  </label>
 
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="convulsions"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'convulsions', type: 'checkbox', checked } })
      }
    />
    Convulsions/Neurologic Problems
  </label>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="allergy"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'allergy', type: 'checkbox', checked } })
      }
    />
    Allergy
  </label>
  <Input
    name="otherConditions"
    placeholder="Other Conditions; Specify"
    className="bg-white text-black border border-black"
    onChange={handleChange}
  />

  <h3 className="font-semibold mt-4 text-black">Level of Activity:</h3>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="normalExam"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'normalExam', type: 'checkbox', checked } })
      }
    />
    Essentially Normal Physical Examination findings on time of Examination
  </label>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="limitedParticipation"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'limitedParticipation', type: 'checkbox', checked } })
      }
    />
    Can participate but with limitation:
  </label>
  <Input
    name="limitedParticipation"
    placeholder="Reason"
    className="bg-white text-black border border-black"
    onChange={handleChange}
  />
  <label className="ml-6 flex items-center gap-2 text-black">
    <Checkbox
      name="light"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'light', type: 'checkbox', checked } })
      }
    />
    Light
  </label>
  <label className="ml-6 flex items-center gap-2 text-black">
    <Checkbox
      name="moderate"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'moderate', type: 'checkbox', checked } })
      }
    />
    Moderate
  </label>
  <label className="flex items-center gap-2 text-black">
    <Checkbox
      name="notFit"
      className="bg-white border-black checked:bg-black checked:border-black checked:!text-white"
      onCheckedChange={(checked) =>
        handleChange({ target: { name: 'notFit', type: 'checkbox', checked } })
      }
    />
    Not fit to participate:
  </label>
  <Input
    name="notFit"
    placeholder="Reason"
    className="bg-white text-black border border-black"
    onChange={handleChange}
  />
</div>


      <Textarea
        className="bg-white text-black placeholder-gray-500 border border-gray-300"
        name="recommendations"
        placeholder="Recommendations"
        onChange={handleChange}
      />

      <Button className="bg-black text-white hover:bg-gray-800" onClick={generatePDF}>
        Generate PDF
      </Button>
    </div>
  );
}
