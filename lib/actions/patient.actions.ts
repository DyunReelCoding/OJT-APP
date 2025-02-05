"use server";

import { ID, Query } from "node-appwrite"
import { BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users } from "../appwrite.config"
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file"



export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );
    return parseStringify( newUser );
  } catch (error: any) {
    if (error && error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      return existingUser.users[0];
    }
  }
}

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);

    return parseStringify(user);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error
    );
  }
};

export const registerPatient = async ({ identificationDocument, ...patient }: RegisterUserParams) => {
  try {
    let file;

    if (identificationDocument) {
      const blobFile = identificationDocument?.get('blobFile') as Blob;
      const fileName = identificationDocument?.get('fileName') as string;

      // Validate if blobFile and fileName exist
      if (!blobFile || !fileName) {
        throw new Error("Invalid file input: Missing blob data or file name.");
      }

      // Convert Blob to ArrayBuffer
      const arrayBuffer = await blobFile.arrayBuffer();

      // Ensure the file is not empty
      if (arrayBuffer.byteLength === 0) {
        throw new Error("Invalid state: Input file is empty.");
      }

      // Convert ArrayBuffer to Buffer for InputFile
      const buffer = Buffer.from(arrayBuffer);

      // Debugging log
      console.log("File successfully converted to Buffer:", { fileName, size: buffer.length });

      // Ensure the buffer has data before creating InputFile
      if (buffer.length === 0) {
        throw new Error("Buffer conversion failed: Empty buffer detected.");
      }

      // Pass the valid buffer to InputFile
      const inputFile = InputFile.fromBuffer(buffer, fileName);

      // Debugging log before uploading
      console.log("Uploading file to storage:", fileName);

      // Upload file
      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      
      console.log("File uploaded successfully:", file.$id);
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: file
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("Error in registerPatient:", error);
    throw error; // Rethrow for better debugging
  }
};
