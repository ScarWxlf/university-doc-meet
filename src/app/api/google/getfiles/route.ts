import { drive } from "@/lib/google";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, userEmail, documentType } = await req.json();
    const rootFolderId = process!.env!.ROOT_FOLDER!;

    if(documentType === "my") {
      const folderResponse = await drive.files.list({
        q: `'${rootFolderId}' in parents and name = 'user-${userId}'`,
      });

      const userFolderId = folderResponse.data.files?.[0]?.id;

      const response = await drive.files.list({
        q: `'${userFolderId}' in parents`,
        fields: "files(id, name, mimeType, createdTime, modifiedTime)",
      });
    return NextResponse.json({ files: response.data.files });
    } else {
      const sharedFiles = await prisma.fileShare.findMany({
        where: {
          userEmail: userEmail,
        }
      });
      console.log(sharedFiles);

      
      const folderResponse = await drive.files.list({
        q: `'${rootFolderId}' in parents and name = 'user-${sharedFiles[0].userOwnerId}'`,
      });
      
      const userFolderId = folderResponse.data.files?.[0]?.id;
      const query = sharedFiles.map(file => `'${file.documentId}' in parens`).join(" or ");

      const response = await drive.files.list({
        q: `'${userFolderId}' in parents and ('${query}')`,
        fields: "files(id, name, mimeType, createdTime, modifiedTime)",
      });
      console.log(response.data)
      return NextResponse.json({ files: response.data.files });
    }

  } catch (error) {
    console.error("Error creating file on Google Drive:", error);
    return NextResponse.json({ error: "Error creating file" }, { status: 500 });
  }
}
