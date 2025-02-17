import { Metadata } from "next";
import StatCard from "@/components/StatCard";
import { Databases, Client } from "appwrite";
import StudentList from "@/components/StudentList";
import SideBar from "@/components/SideBar"; 

// Configure Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.PROJECT_ID!);

const databases = new Databases(client);

async function fetchStudents() {
  try {
    const response = await databases.listDocuments(
      process.env.DATABASE_ID!,
      process.env.PATIENT_COLLECTION_ID!
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

// Admin page component (Server Component)
const Admin = async () => {
  const students = await fetchStudents();

  return (
    <div className="flex h-screen">
      
      <SideBar />

      
      <div className="flex-1 p-6">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <h1 className="header">Welcome 👋</h1>
            <p className="text-dark-700">Start the day managing patients' well-being</p>
          </section>

          <section className="admin-stat">
            <StatCard
              type="students"
              count={students.length}
              label="Number of Patients"
              icon="/assets/icons/appointments.svg"
            />
          </section>

          {/* Student List Component */}
          <StudentList students={students} />
        </main>
      </div>
    </div>
  );
};

export default Admin;
