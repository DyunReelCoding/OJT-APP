import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { jsPDF } from 'jspdf';

export default function MedicalClearanceForm() {
  const [formData, setFormData] = useState({
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
    limitedParticipation: false,
    light: false,
    moderate: false,
    notFit: false,
    recommendations: '',
  });

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

    doc.text('CARAGA STATE UNIVERSITY', 20, 20);
    doc.text('UNIVERSITY CENTER FOR HEALTH AND WELLNESS', 20, 30);
    doc.text('MEDICAL CLEARANCE', 20, 40);

    doc.text(`This is to certify that I have seen and examined Mr/Ms. ${formData.name},`, 20, 50);
    doc.text(`${formData.age} years old, (${formData.civilStatus}), and a resident of ${formData.resident}`, 20, 60);

    doc.text(`Purpose: ${formData.purpose}`, 20, 70);
    doc.text(`Schedule: ${formData.schedule}`, 20, 80);
    doc.text(`Destination: ${formData.destination}`, 20, 90);

    doc.text('With the following Vital Signs:', 20, 100);
    doc.text(`BP: ${formData.bp}`, 20, 110);
    doc.text(`PR: ${formData.pr}`, 20, 120);
    doc.text(`Height: ${formData.height}`, 20, 130);
    doc.text(`Weight: ${formData.weight}`, 20, 140);

    doc.text('Health History:', 20, 150);
    doc.text(`Asthma: ${formData.asthma ? '✔' : '✘'}`, 20, 160);
    doc.text(`Heart Disease: ${formData.heartDisease ? '✔' : '✘'}`, 20, 170);
    doc.text(`Other Conditions: ${formData.otherConditions}`, 20, 180);
    doc.text(`Convulsions/Neurologic Problems: ${formData.convulsions ? '✔' : '✘'}`, 20, 190);
    doc.text(`Allergy: ${formData.allergy ? '✔' : '✘'}`, 20, 200);

    doc.text('Assessment:', 20, 210);
    doc.text(`Essentially Normal Physical Examination: ${formData.normalExam ? '✔' : '✘'}`, 20, 220);
    doc.text(`Can participate but with limitation: ${formData.limitedParticipation ? '✔' : '✘'}`, 20, 230);
    doc.text(`Light: ${formData.light ? '✔' : '✘'}   Moderate: ${formData.moderate ? '✔' : '✘'}`, 20, 240);
    doc.text(`Not fit to participate: ${formData.notFit ? '✔' : '✘'}`, 20, 250);

    doc.text(`Recommendations: ${formData.recommendations}`, 20, 260);

    doc.save('Medical_Clearance.pdf');
  };

  return (
    <div className="p-6 space-y-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-black">Medical Clearance Form</h2>

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
    Not fit to participate
  </label>
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
