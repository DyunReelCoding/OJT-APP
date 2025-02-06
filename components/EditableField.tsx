"use client";

import { useState } from "react";
import { Databases, Client } from "appwrite";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa"; // Import pen, save, and spinner icons

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

const databases = new Databases(client);

interface EditableFieldProps {
  label: string;
  value: string;
  userId: string;
  fieldName: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  userId,
  fieldName,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
        userId,
        { [fieldName]: inputValue }
      );
      setIsEditing(false);
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <strong>{label}:</strong>
      {isEditing ? (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border border-gray-600 bg-gray-700 text-white p-1 rounded"
        />
      ) : (
        <span>{value || "N/A"}</span>
      )}
      {isEditing ? (
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          {loading ? (
            <FaSpinner className="text-sm animate-spin" /> // Show spinner when loading
          ) : (
            <FaSave className="text-sm" /> // Save icon
          )}
        </button>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="px-2 py-1  hover:bg-blue-600 text-white rounded flex items-center gap-1"
        >
          <FaPen className="text-sm" /> {/* Pen icon for editing */}
        </button>
      )}
    </div>
  );
};

export default EditableField;
