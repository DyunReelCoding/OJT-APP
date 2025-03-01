import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const { email, enteredOtp } = await req.json();

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT as string)
      .setProject(process.env.NEXT_PUBLIC_PROJECT_ID as string)
      .setKey(process.env.API_KEY as string);

    const databases = new Databases(client);

    const otpDocs = await databases.listDocuments(
      process.env.DATABASE_ID as string,
      process.env.NEXT_PUBLIC_OTP_COLLECTION_ID as string,
      [Query.equal("email", email), Query.equal("otp", enteredOtp)]
    );

    if (otpDocs.total === 0) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const otpData = otpDocs.documents[0];

    if (Date.now() > otpData.expiresAt) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
