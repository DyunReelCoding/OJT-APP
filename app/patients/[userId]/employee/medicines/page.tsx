"use client";

import { useEffect, useState } from "react";
import { Client, Databases, ID } from "appwrite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Edit, CheckCircle, Search, Plus, X, RefreshCw } from "lucide-react";
import EmployeeSideBar from "@/components/EmployeeSideBar";
import { useParams } from "next/navigation";

interface Medicine {
  $id: string;
  name: string;
  brand: string;
  category: string;
  stock: string;
  location: string;
  expiryDate: string;
}

const MedicinesPage = () => {
  const params = useParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, '$id'>>({
    name: "",
    brand: "",
    category: "",
    stock: "",
    location: "",
    expiryDate: "",
  });

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
  
  const databases = new Databases(client);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_MEDICINES_COLLECTION_ID!
      );
      setMedicines(response.documents);
      setFilteredMedicines(response.documents);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500";
      case "Low Stock":
        return "bg-blue-500";
      case "Expiring Soon":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredMedicines(medicines);
    } else {
      setFilteredMedicines(
        medicines.filter((medicine) =>
          medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, medicines]);

  const addMedicine = async () => {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b486f5000ff28439c6",
        ID.unique(),
        {
          name: newMedicine.name,
          brand: newMedicine.brand,
          category: newMedicine.category,
          stock: newMedicine.stock,
          location: newMedicine.location,
          expiryDate: newMedicine.expiryDate,
        }
      );
      
      setMedicines([...medicines, response as Medicine]);
      setMessage("Medicine added successfully! ✅");
      setNewMedicine({
        name: "",
        brand: "",
        category: "",
        stock: "",
        location: "",
        expiryDate: "",
      });
    } catch (error) {
      console.error("Error adding medicine:", error);
      setMessage("Failed to add medicine ❌");
    }
  };

  const updateMedicine = async (id: string, medicine: Medicine) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b486f5000ff28439c6",
        id,
        {
          name: medicine.name,
          brand: medicine.brand,
          category: medicine.category,
          stock: medicine.stock,
          location: medicine.location,
          expiryDate: medicine.expiryDate
        }
      );
      
      fetchMedicines(); // Refresh the list after update
      setEditingId(null);
      setMessage("Medicine updated successfully! ✅");
    } catch (error) {
      console.error("Error updating medicine:", error);
      setMessage("Failed to update medicine ❌");
    }
  };

  const deleteMedicine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        "67b486f5000ff28439c6",
        id
      );
      
      setMedicines(medicines.filter(med => med.$id !== id));
      setMessage("Medicine deleted successfully! ✅");
    } catch (error) {
      console.error("Error deleting medicine:", error);
      setMessage("Failed to delete medicine ❌");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <EmployeeSideBar userId={params.userId as string} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-700">Medicines Inventory</h1>
              <p className="text-gray-600 mt-2">Manage medicine stock and inventory</p>
            </div>
            <Button 
              onClick={fetchMedicines}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>

          {message && (
            <div className="bg-green-600 text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2 shadow-md">
              <CheckCircle size={20} />
              {message}
              <X className="ml-auto cursor-pointer hover:bg-green-700 rounded-full p-1" 
                onClick={() => setMessage(null)} />
            </div>
          )}

          <div className="bg-white p-8 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Add New Medicine</h2>
            <div className="grid grid-cols-3 gap-6">
              <Input
                placeholder="Medicine Name"
                value={newMedicine.name}
                onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
              <Input
                placeholder="Brand"
                value={newMedicine.brand}
                onChange={(e) => setNewMedicine({...newMedicine, brand: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
              <Input
                placeholder="Category"
                value={newMedicine.category}
                onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
              <Input
                type="number"
                placeholder="Stock"
                value={newMedicine.stock}
                onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
              <Input
                placeholder="Location"
                value={newMedicine.location}
                onChange={(e) => setNewMedicine({...newMedicine, location: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
              <Input
                type="date"
                value={newMedicine.expiryDate}
                onChange={(e) => setNewMedicine({...newMedicine, expiryDate: e.target.value})}
                className="border-gray-300 focus:border-blue-500"
              />
              <Button 
                onClick={addMedicine} 
                className="bg-blue-700 hover:bg-blue-800 col-span-3"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Medicine
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 maxw-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicines..."
                className="pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Medicine Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Brand</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Expiry Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.$id} className="border-t">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {editingId === medicine.$id ? (
                          <Input
                            value={medicine.name}
                            onChange={(e) => setMedicines(medicines.map(m => 
                              m.$id === medicine.$id ? {...m, name: e.target.value} : m
                            ))}
                          />
                        ) : (
                          medicine.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {editingId === medicine.$id ? (
                          <Input
                            value={medicine.brand}
                            onChange={(e) => setMedicines(medicines.map(m => 
                              m.$id === medicine.$id ? {...m, brand: e.target.value} : m
                            ))}
                          />
                        ) : (
                          medicine.brand
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {editingId === medicine.$id ? (
                          <Input
                            value={medicine.category}
                            onChange={(e) => setMedicines(medicines.map(m => 
                              m.$id === medicine.$id ? {...m, category: e.target.value} : m
                            ))}
                          />
                        ) : (
                          medicine.category
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {editingId === medicine.$id ? (
                          <Input
                            type="number"
                            value={medicine.stock}
                            onChange={(e) => setMedicines(medicines.map(m => 
                              m.$id === medicine.$id ? {...m, stock: e.target.value} : m
                            ))}
                          />
                        ) : (
                          medicine.stock
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {editingId === medicine.$id ? (
                          <Input
                            value={medicine.location}
                            onChange={(e) => setMedicines(medicines.map(m => 
                              m.$id === medicine.$id ? {...m, location: e.target.value} : m
                            ))}
                          />
                        ) : (
                          medicine.location
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {editingId === medicine.$id ? (
                          <Input
                            type="date"
                            value={medicine.expiryDate}
                            onChange={(e) => setMedicines(medicines.map(m => 
                              m.$id === medicine.$id ? {...m, expiryDate: e.target.value} : m
                            ))}
                          />
                        ) : (
                          medicine.expiryDate
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex gap-2">
                          {editingId === medicine.$id ? (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => updateMedicine(medicine.$id, medicine)}
                            >
                              <CheckCircle className="text-green-500" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingId(medicine.$id)}
                            >
                              <Edit className="text-blue-500" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteMedicine(medicine.$id)}
                          >
                            <Trash className="text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicinesPage; 