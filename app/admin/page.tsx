"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import StudentList from "@/components/StudentList";
import SideBar from "@/components/SideBar";

const Admin = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [patientsCount, setPatientsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students/");
        if (!res.ok) throw new Error("Failed to fetch students");

        const data = await res.json();
        setStudents(data);

        // Normalize and count occupations
        const normalizeOccupation = (occupation: string) =>
          occupation.toLowerCase().replace(/s$/, "");

        setPatientsCount(data.length);
        setStudentsCount(data.filter((doc: any) => normalizeOccupation(doc.occupation) === "student").length);
        setEmployeesCount(data.filter((doc: any) => normalizeOccupation(doc.occupation) === "employee").length);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="flex bg-gray-50">
      
      <SideBar />

      <div className="flex-1 p-6">
        
        <main className="admin-main">
          
          <section className="w-full space-y-4">
            <h1 className="header text-green-400">Welcome 👋</h1>
            <p className="text-dark-700">Start the day managing patients' well-being</p>
          </section>

          <section className="admin-stat grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard type="patients" count={patientsCount} label="Number of Patients" icon="/assets/icons/appointments.svg" />
            <StatCard type="students" count={studentsCount} label="Number of Students" icon="/assets/icons/appointments.svg" />
            <StatCard type="employees" count={employeesCount} label="Number of Employees" icon="/assets/icons/appointments.svg" />
          </section>

          <StudentList />

        </main>
      </div>
    </div>
  );
};

export default Admin;
