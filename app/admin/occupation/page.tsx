"use client";

import { useEffect, useState } from "react";
import { Client, Databases, ID } from "appwrite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Edit, CheckCircle, Search } from "lucide-react";
import SideBar from "@/components/SideBar";

// Define Occupation and Office Type
interface Occupation {
  $id: string;
  name: string;
}

// Appwrite Environment Variables
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID!;
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const OCCUPATION_COLLECTION_ID = process.env.NEXT_PUBLIC_OCCUPATIONTYPE_COLLECTION_ID!;
const OFFICETYPE_COLLECTION_ID = process.env.NEXT_PUBLIC_OFFICETYPE_COLLECTION_ID!;
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT!;

// Appwrite Client & Database
const client = new Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

const OccupationManagement = () => {
  const [items, setItems] = useState<Occupation[]>([]);
  const [filteredItems, setFilteredItems] = useState<Occupation[]>([]);
  const [newItem, setNewItem] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatedItem, setUpdatedItem] = useState("");
  const [isOccupation, setIsOccupation] = useState(true); // Toggle between occupation and office

  useEffect(() => {
    fetchItems();
  }, [isOccupation]);

  // Fetch Occupation or Office Items
  const fetchItems = async () => {
    try {
      const collectionId = isOccupation ? OCCUPATION_COLLECTION_ID : OFFICETYPE_COLLECTION_ID;
      const response = await databases.listDocuments(DATABASE_ID, collectionId);
      const formattedItems: Occupation[] = response.documents.map((doc) => ({
        $id: doc.$id,
        name: doc.name,
      }));
      setItems(formattedItems);
      setFilteredItems(formattedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Search Filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items);
    } else {
      setFilteredItems(
        items.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, items]);

  // Add Item (Occupation/Office)
  const addItem = async () => {
    if (!newItem) return;
    try {
      const collectionId = isOccupation ? OCCUPATION_COLLECTION_ID : OFFICETYPE_COLLECTION_ID;
      const response = await databases.createDocument(
        DATABASE_ID,
        collectionId,
        ID.unique(),
        { name: newItem }
      );
      
      const newEntry = { $id: response.$id, name: response.name };
      setItems([...items, newEntry]);
      setFilteredItems([...items, newEntry]);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Update Item (Occupation/Office)
  const updateItem = async ($id: string) => {
    if (!updatedItem) return;
    try {
      const collectionId = isOccupation ? OCCUPATION_COLLECTION_ID : OFFICETYPE_COLLECTION_ID;
      await databases.updateDocument(DATABASE_ID, collectionId, $id, { name: updatedItem });
      
      const updatedList = items.map((item) =>
        item.$id === $id ? { ...item, name: updatedItem } : item
      );
      setItems(updatedList);
      setFilteredItems(updatedList);
      setEditingId(null);
      setUpdatedItem("");
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Delete Item (Occupation/Office)
  const deleteItem = async ($id: string) => {
    try {
      const collectionId = isOccupation ? OCCUPATION_COLLECTION_ID : OFFICETYPE_COLLECTION_ID;
      await databases.deleteDocument(DATABASE_ID, collectionId, $id);
      
      const filteredList = items.filter((item) => item.$id !== $id);
      setItems(filteredList);
      setFilteredItems(filteredList);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="flex">
      <SideBar />
      <div className="flex flex-col items-center justify-center w-full min-h-screen p-6 bg-gray-900 text-white">
        <div className="flex justify-between w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6">
            Manage {isOccupation ? "Occupations" : "Office Types"}
          </h2>
          <Button
            onClick={() => setIsOccupation(!isOccupation)}
            className="bg-blue-600 hover:bg-blue-700 px-4"
          >
            Switch to {isOccupation ? "Office Types" : "Occupations"}
          </Button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 mb-4 w-full max-w-lg">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${isOccupation ? "occupation" : "office type"}...`}
          />
        </div>

        {/* Add Item (Occupation/Office) */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`Enter ${isOccupation ? "occupation" : "office type"} name`}
          />
          <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700">
            Add
          </Button>
        </div>

        {/* Item List */}
        <ul className="mt-6 w-full max-w-lg">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <li key={item.$id} className="flex justify-between p-2 border-b border-gray-700 items-center">
                {editingId === item.$id ? (
                  <input
                    type="text"
                    value={updatedItem}
                    onChange={(e) => setUpdatedItem(e.target.value)}
                    className="bg-gray-800 text-white px-2 py-1 rounded-md border border-gray-600"
                  />
                ) : (
                  <span className="text-lg">{item.name}</span>
                )}

                <div className="flex gap-2">
                  {editingId === item.$id ? (
                    <Button variant="ghost" onClick={() => updateItem(item.$id)} className="text-green-400 hover:text-green-500">
                      <CheckCircle size={16} />
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => { setEditingId(item.$id); setUpdatedItem(item.name); }} className="text-yellow-400 hover:text-yellow-500">
                      <Edit size={16} />
                    </Button>
                  )}

                  <Button variant="ghost" onClick={() => deleteItem(item.$id)} className="text-red-400 hover:text-red-500">
                    <Trash size={16} />
                  </Button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-4">No items found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default OccupationManagement;
