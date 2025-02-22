"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Databases, Client } from "appwrite";
import EmployeeSideBar from "@/components/EmployeeSideBar";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface Employee {
  $id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  office: string;
  position: string;
  employeeId: string;
  dateJoined: string;
  emergencyContact: string;
  address: string;
}

const EmployeeDetailPage = () => {
  const params = useParams();
  const userId = params.userId as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
  
  const databases = new Databases(client);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const data = await databases.getDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
        userId
      );
      setEmployee(data as Employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <EmployeeSideBar userId={userId} />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Employee Details</h1>
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4" />
                Edit Details
              </Button>
            </div>

            {employee && (
              <div className="p-6 grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.department}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Office</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.office}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Position</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.position}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.employeeId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date Joined</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.dateJoined}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.emergencyContact}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-lg text-gray-800">{employee.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage; 