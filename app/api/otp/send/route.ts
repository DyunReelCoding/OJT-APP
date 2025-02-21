import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Fixes the self-signed certificate error
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_NAME,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });

    return NextResponse.json({ otp });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
