import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Client, Databases, ID } from "node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_NAME,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 15 minutes.`,
    });

    // Store OTP in Appwrite database
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT as string)
      .setProject(process.env.NEXT_PUBLIC_PROJECT_ID as string)
      .setKey(process.env.API_KEY as string);

    const databases = new Databases(client);

    await databases.createDocument(
      process.env.DATABASE_ID as string,
      process.env.NEXT_PUBLIC_OTP_COLLECTION_ID as string,
      ID.unique(),
      {
        email,
        otp,
        expiresAt,
      }
    );

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
