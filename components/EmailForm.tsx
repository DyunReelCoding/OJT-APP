"use client";

import { useState, useEffect } from "react";

const EmailForm = ({ studentEmail }: { studentEmail: string }) => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(studentEmail); // Auto-fill email
  }, [studentEmail]);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, subject, message }),
      });

      const result = await response.json();
      setStatus(result.success ? "Email sent successfully!" : "Failed to send email.");
    } catch (error) {
      console.error("Error:", error);
      setStatus("Error sending email.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-700 text-black">
      <h2 className="text-2xl font-semibold text-blue-700 mb-5">Send an Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          readOnly // Prevent editing
          className="w-full p-2 rounded-md bg-gray-50 text-black border-2 border-blue-700 cursor-not-allowed focus:outline-none"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full p-2 rounded-md bg-gray-50 text-black border-2 border-blue-700 focus:outline-none"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full p-2 rounded-md bg-gray-50 text-black border-2 border-blue-700 focus:outline-none"
        ></textarea>
        <button
          type="submit"
          className="px-4 py-2 border-2 border-blue-700 bg-blue-700 hover:bg-white hover:text-blue-700 text-white font-semibold rounded-lg shadow-md"
        >
          Send Email
        </button>
      </form>
      {status && <p className="mt-2 text-white">{status}</p>}
    </div>
  );
};

export default EmailForm;
