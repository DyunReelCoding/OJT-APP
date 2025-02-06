import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message } = await req.json(); // Extract email data

    // Configure Nodemailer using environment variables
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // False for TLS (587), true for SSL (465)
      auth: {
        user: process.env.EMAIL_NAME, // Use environment variable
        pass: process.env.EMAIL_PASSWORD, // Use environment variable
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_NAME,
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: `Email sent: ${info.response}` });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
