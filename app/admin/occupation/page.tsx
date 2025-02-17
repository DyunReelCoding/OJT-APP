"use client";

import { useEffect, useState } from "react";
import { Client, Databases, ID } from "appwrite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Edit, CheckCircle, Search } from "lucide-react";
import SideBar from "@/components/SideBar";

// Define Occupation Type
interface Occupation {
  $id: string;
  name: string;
}

// Appwrite Environment Variables
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID!;
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const OCCUPATION_COLLECTION_ID = process.env.NEXT_PUBLIC_OCCUPATIONTYPE_COLLECTION_ID!;
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT!;

// Appwrite Client & Database
const client = new Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

const OccupationManagement = () => {
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [filteredOccupations, setFilteredOccupations] = useState<Occupation[]>([]);
  const [newOccupation, setNewOccupation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatedOccupation, setUpdatedOccupation] = useState("");

  useEffect(() => {
    fetchOccupations();
  }, []);

  // Fetch Occupations
  const fetchOccupations = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, OCCUPATION_COLLECTION_ID);
      const formattedOccupations: Occupation[] = response.documents.map((doc) => ({
        $id: doc.$id,
        name: doc.name,
      }));
      setOccupations(formattedOccupations);
      setFilteredOccupations(formattedOccupations);
    } catch (error) {
      console.error("Error fetching occupations:", error);
    }
  };

  // Search Occupations
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOccupations(occupations);
    } else {
      setFilteredOccupations(
        occupations.filter((occ) =>
          occ.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, occupations]);

  // Add Occupation
  const addOccupation = async () => {
    if (!newOccupation) return;
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        OCCUPATION_COLLECTION_ID,
        ID.unique(),
        { name: newOccupation }
      );

      const newEntry = { $id: response.$id, name: response.name };
      setOccupations([...occupations, newEntry]);
      setFilteredOccupations([...occupations, newEntry]);
      setNewOccupation("");
    } catch (error) {
      console.error("Error adding occupation:", error);
    }
  };

  // Update Occupation
  const updateOccupation = async ($id: string) => {
    if (!updatedOccupation) return;
    try {
      await databases.updateDocument(DATABASE_ID, OCCUPATION_COLLECTION_ID, $id, {
        name: updatedOccupation,
      });

      const updatedList = occupations.map((occ) =>
        occ.$id === $id ? { ...occ, name: updatedOccupation } : occ
      );
      setOccupations(updatedList);
      setFilteredOccupations(updatedList);
      setEditingId(null);
      setUpdatedOccupation("");
    } catch (error) {
      console.error("Error updating occupation:", error);
    }
  };

  // Delete Occupation
  const deleteOccupation = async ($id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, OCCUPATION_COLLECTION_ID, $id);
      const filteredList = occupations.filter((occ) => occ.$id !== $id);
      setOccupations(filteredList);
      setFilteredOccupations(filteredList);
    } catch (error) {
      console.error("Error deleting occupation:", error);
    }
  };

  return (
    <div className="flex">
      <SideBar />
      <div className="flex flex-col items-center justify-center w-full min-h-screen p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-6">Manage Occupations</h2>

        {/* Search Input */}
        <div className="flex items-center gap-2 mb-4 w-full max-w-lg">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search occupation..."
          />
        </div>

        {/* Add Occupation */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={newOccupation}
            onChange={(e) => setNewOccupation(e.target.value)}
            placeholder="Enter occupation name"
          />
          <Button onClick={addOccupation} className="bg-blue-600 hover:bg-blue-700">
            Add
          </Button>
        </div>

        {/* Occupation List */}
        <ul className="mt-6 w-full max-w-lg">
          {filteredOccupations.length > 0 ? (
            filteredOccupations.map((occ) => (
              <li key={occ.$id} className="flex justify-between p-2 border-b border-gray-700 items-center">
                {editingId === occ.$id ? (
                  <input
                    type="text"
                    value={updatedOccupation}
                    onChange={(e) => setUpdatedOccupation(e.target.value)}
                    className="bg-gray-800 text-white px-2 py-1 rounded-md border border-gray-600"
                  />
                ) : (
                  <span className="text-lg">{occ.name}</span>
                )}

                <div className="flex gap-2">
                  {editingId === occ.$id ? (
                    <Button variant="ghost" onClick={() => updateOccupation(occ.$id)} className="text-green-400 hover:text-green-500">
                      <CheckCircle size={16} />
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => { setEditingId(occ.$id); setUpdatedOccupation(occ.name); }} className="text-yellow-400 hover:text-yellow-500">
                      <Edit size={16} />
                    </Button>
                  )}

                  <Button variant="ghost" onClick={() => deleteOccupation(occ.$id)} className="text-red-400 hover:text-red-500">
                    <Trash size={16} />
                  </Button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-4">No occupations found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default OccupationManagement;
