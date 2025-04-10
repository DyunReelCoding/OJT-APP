import { NextResponse } from "next/server";
import databases  from "@/lib/appwrite";
import { Query } from "appwrite";

export const GET = async () => {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [Query.limit(10000)] // Adjust limit if necessary
    );
    return NextResponse.json(response.documents, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json(); // Ensure body has { id }

    const response = await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      id
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
};
