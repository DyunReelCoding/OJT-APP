"use client";

import { useState } from "react";
import { Databases } from "appwrite";
import { Client } from "appwrite";

const databases = new Databases(
  new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.PROJECT_ID!)

);



interface EditableFieldProps {
  label: string;
  field: string;
  value: string;
  userId: string;
  collectionId: string;
  databaseId: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
    label,
    field,
    value,
    userId,
    collectionId,
    databaseId,
  }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [loading, setLoading] = useState(false);
  
    const handleUpdate = async () => {
      if (!inputValue.trim()) return;
      setLoading(true);
  
      try {
        await databases.updateDocument(databaseId, collectionId, userId, {
          [field]: inputValue,
        });
        alert(`${label} updated successfully!`);
      } catch (error) {
        console.error(`Error updating ${field}:`, error);
        alert("Update failed. Please try again.");
      } finally {
        setEditing(false);
        setLoading(false);
      }
    };
  
    return (
      <p className="text-gray-400">
        <strong>{label}:</strong>{" "}
        {editing ? (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="p-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800"
            />
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="ml-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <>
            {value}{" "}
            <button
              onClick={() => setEditing(true)}
              className="ml-2 text-blue-400 hover:underline"
            >
              Edit
            </button>
          </>
        )}
      </p>
    );
  };
  

export default EditableField;
