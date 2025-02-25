import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);

const databases = new Databases(client);

export async function POST(req: Request) {
  try {
    const { email, otp, enteredOtp } = await req.json();

    if (otp !== enteredOtp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [`equal("email", "${email}")`]
    );

    if (response.documents.length > 0) {
      const patient = response.documents[0];
      if (patient.occupation === "student") {
        return NextResponse.json({
          redirectUrl: `/patients/${patient.$id}/student`,
        });
      }
    }

    return NextResponse.json({ message: "Verification successful" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
