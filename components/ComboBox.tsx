"use client";

interface ComboBoxProps {
  filterType: string;
  setFilterType: (value: string) => void;
}

const ComboBox = ({ filterType, setFilterType }: ComboBoxProps) => {
  return (
    <select
      className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      value={filterType}
      onChange={(e) => setFilterType(e.target.value)}
    >
      <option value="">All Students</option>
      <option value="allergies">Allergies</option>
      <option value="currentMedication">Current Medication</option>
      <option value="familyMedicalHistory">Family Medical History</option>
      <option value="pastMedicalHistory">Past Medical History</option>
      <option value="bloodType">Blood Type</option>
      <option value="religion">Religion</option>
      <option value="age">Age</option>
      <option value="bmiCategory">BMI Category</option>
      <option value="civilStatus">Civil Status</option>
      <option value="personWithDisability">PWD</option>
    </select>
  );
};

export default ComboBox;
