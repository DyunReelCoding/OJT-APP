"use server";

import { ID, Query } from "node-appwrite";
import { 
  BUCKET_ID, 
  DATABASE_ID, 
  databases, 
  ENDPOINT, 
  PATIENT_COLLECTION_ID, 
  PROJECT_ID, 
  storage, 
  users 
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";

export const createUser = async (user: CreateUserParams) => {
  try {
    const fullName = `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName} ${user.suffix ? user.suffix : ""}`.trim();

    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      fullName
    );

    return parseStringify(newUser);
  } catch (error: any) {
    if (error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);
      return existingUser.users[0];
    }
    throw error;
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.error("An error occurred while retrieving the user details:", error);
  }
};

export const registerPatient = async ({ identificationDocument, ...patient }: RegisterUserParams) => {
  try {
    let file;

    if (identificationDocument) {
      const blobFile = identificationDocument?.get("blobFile") as Blob;
      const fileName = identificationDocument?.get("fileName") as string;

      if (!blobFile || !fileName) {
        throw new Error("Invalid file input: Missing blob data or file name.");
      }

      const arrayBuffer = await blobFile.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error("Invalid state: Input file is empty.");
      }

      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length === 0) {
        throw new Error("Buffer conversion failed: Empty buffer detected.");
      }

      const inputFile = InputFile.fromBuffer(buffer, fileName);
      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      
      console.log("File uploaded successfully:", file.$id);
    }

    // Construct the full name for the 'name' field
    const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + " " : ""}${patient.lastName} ${patient.suffix ? patient.suffix : ""}`.trim();

    // Create the patient document with 'name' field
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        ...patient,
        name: fullName, // Ensure 'name' is included
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: file
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("Error in registerPatient:", error);
    throw error;
  }
};

export const createUnavailableSlot = async (slot: {
  date: string;
  timeRange: string;
  reason?: string;
}) => {
  try {
    const newSlot = await databases.createDocument(
      DATABASE_ID!,
      "67cd8eaa000fac61575d", // Unavailable slots collection ID
      ID.unique(),
      {
        date: slot.date,
        timeRange: slot.timeRange,
        reason: slot.reason || "Appointment scheduled",
      }
    );
    return parseStringify(newSlot);
  } catch (error) {
    console.error("Error creating unavailable slot:", error);
    throw error;
  }
};