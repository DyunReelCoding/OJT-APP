"use client";

import { useEffect, useState } from "react";
import { Client, Databases, ID } from "appwrite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Edit, CheckCircle, Search, RefreshCw } from "lucide-react";
import SideBar from "@/components/SideBar";

interface Medicine {
  $id: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  location: string;
  expiryDate: string;
  status: "In Stock" | "Low Stock" | "Expiring Soon";
}

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Initialize Appwrite Client
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

  // Search Filter
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

  return (
    <div className="flex h-screen">
      <SideBar />
      <div className="flex-1 p-6">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <h1 className="header">Medicines Inventory</h1>
            <p className="text-dark-700">Manage medicine stock and inventory</p>
          </section>

          <div className="flex items-center gap-2 mb-4 w-full max-w-lg">
            <Search size={20} className="text-gray-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicines..."
              className="bg-dark-400 border-dark-500"
            />
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse shad-table">
              <thead>
                <tr className="shad-table-row-header">
                  <th className="p-4 text-left">Medicine Name</th>
                  <th className="p-4 text-left">Brand</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Location</th>
                  <th className="p-4 text-left">Expiry Date</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.$id} className="shad-table-row">
                    <td className="p-4">{medicine.name}</td>
                    <td className="p-4">{medicine.brand}</td>
                    <td className="p-4">{medicine.category}</td>
                    <td className="p-4">{medicine.stock}</td>
                    <td className="p-4">{medicine.location}</td>
                    <td className="p-4">{medicine.expiryDate}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(medicine.status)}`}>
                        {medicine.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash className="text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MedicinesPage; 