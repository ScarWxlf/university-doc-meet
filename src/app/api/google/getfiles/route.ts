import { drive } from "@/lib/google";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
function getFormattedDate(selectedDate: Date) {
  const localDate = new Date(selectedDate);
  localDate.setHours(0, 0, 0, 0);
  const utcDate = new Date(
    localDate.getTime() - localDate.getTimezoneOffset() * 60000
  );
  const startOfDay = new Date(utcDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(utcDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const formattedStart = startOfDay.toISOString().split(".")[0];
  const formattedEnd = endOfDay.toISOString().split(".")[0];
  return { formattedStart, formattedEnd };
}

export async function POST(req: Request) {
  try {
    const { userId, userEmail, documentType, searchName, selectedDate } =
      await req.json();
    const rootFolderId = process!.env!.ROOT_FOLDER!;
    let formattedStart = "", formattedEnd = "";
    if (selectedDate) {
      ({ formattedStart, formattedEnd } = getFormattedDate(
        new Date(selectedDate)
      ));
    }
    if (documentType === "my") {
      const folderResponse = await drive.files.list({
        q: `'${rootFolderId}' in parents and name = 'user-${userId}'`,
      });

      const userFolderId = folderResponse.data.files?.[0]?.id;
      const queryParts = [`'${userFolderId}' in parents`, `trashed=false`];
      if (searchName) {
        queryParts.push(`name contains '${searchName}'`);
      }
      if (selectedDate) {
        queryParts.push(
          `createdTime >= '${formattedStart}' and createdTime < '${formattedEnd}'`
        );
      }

      const query = queryParts.join(" and ");
      const response = await drive.files.list({
        q: query,
        fields: "files(id, name, mimeType, createdTime, modifiedTime)",
      });
      const user = await prisma.user.findFirst({
        where: {
          id: parseInt(userId),
        }
      })
      const files = response.data.files?.map((file) => ({
        ...file,
        userOwnerEmail: user?.email, 
      }));
      return NextResponse.json({ files: files });
    } else {
      if (!userEmail) {
        return NextResponse.json({ files: [] });
      }
      const sharedFiles = await prisma.fileShare.findMany({
        where: {
          userEmail: userEmail,
        },
        include: {
          owner: {
            select: {
              email: true,
            }
          }
        }
      });

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
        userOwnerEmail: sharedFiles[index].owner.email,
      }));

      if (searchName) {
        files = files.filter((file) =>
          file!.name!.toLowerCase().includes(searchName.toLowerCase())
        );
      }

      if (selectedDate) {
        files = files.filter((file) => {
          const createdTime = file.createdTime
            ? new Date(file.createdTime).getTime()
            : 0;
          return (
            createdTime >= new Date(formattedStart).getTime() &&
            createdTime < new Date(formattedEnd).getTime()
          );
        });
      }

      return NextResponse.json({ files: files });
    }
  } catch (error) {
    console.error("Error getting files:", error as Error);
    return NextResponse.json({ error: "Error creating file:" + (error as Error).message }, { status: 500 });
  }
}
