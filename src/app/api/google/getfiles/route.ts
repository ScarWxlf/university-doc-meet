import { drive } from "@/lib/google";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, userEmail, documentType, searchName } = await req.json();
    const rootFolderId = process!.env!.ROOT_FOLDER!;
    if (documentType === "my") {
      const folderResponse = await drive.files.list({
        q: `'${rootFolderId}' in parents and name = 'user-${userId}'`,
      });

      const userFolderId = folderResponse.data.files?.[0]?.id;
      const query = searchName ? `'${userFolderId}' in parents and name contains '${searchName}'` : `'${userFolderId}' in parents`;
      const response = await drive.files.list({
        q: query,
        fields: "files(id, name, mimeType, createdTime, modifiedTime)",
      });
      return NextResponse.json({ files: response.data.files });
    } else {
      if (!userEmail) {
        return NextResponse.json({ files: [] });
      }
      const sharedFiles = await prisma.fileShare.findMany({
        where: {
          userEmail: userEmail,
        },
      });
      // const folderResponse = await drive.files.list({
      //   q: `'${rootFolderId}' in parents and name = 'user-${sharedFiles[0].userOwnerId}'`,
      // });

      // const userFolderId = folderResponse.data.files?.[0]?.id;

      const responses = await Promise.all(
        sharedFiles.map((fileId) =>
          drive.files.get({
            fileId: fileId.documentId,
            fields: "id, name, mimeType, createdTime, modifiedTime",
          })
        )
      );

      let files = responses.map((response, index) => ({
        ...response.data,
        userOwnerId: sharedFiles[index].userOwnerId.toString(),
      }));
    
      if (searchName) {
        files = files.filter((file) =>
          file!.name!.toLowerCase().includes(searchName.toLowerCase())
        );
      }

      return NextResponse.json({ files: files });
    }
  } catch (error) {
    console.error("Error creating file on Google Drive:", error as Error);
    return NextResponse.json({ error: "Error creating file" }, { status: 500 });
  }
}
