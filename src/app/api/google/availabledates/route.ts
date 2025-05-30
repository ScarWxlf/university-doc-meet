import { drive } from "@/lib/google";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, userEmail, documentType } = await req.json();
    const rootFolderId = process.env.ROOT_FOLDER!;
    let allDates: Date[] = [];

    if (documentType === "my") {
      const folderResponse = await drive.files.list({
        q: `'${rootFolderId}' in parents and name = 'user-${userId}'`,
      });

      const userFolderId = folderResponse.data.files?.[0]?.id;

      if (!userFolderId) return NextResponse.json({ dates: [] });

      const response = await drive.files.list({
        q: `'${userFolderId}' in parents and trashed=false`,
        fields: "files(createdTime)",
      });

      allDates = (response.data.files || []).map(file => new Date(file.createdTime!));
    }

    if (documentType === "shared" && userEmail) {
      const sharedFiles = await prisma.fileShare.findMany({
        where: { userEmail },
      });

      const responses = await Promise.all(
        sharedFiles.map(file =>
          drive.files.get({
            fileId: file.documentId,
            fields: "createdTime",
          })
        )
      );

      allDates = responses.map(res => new Date(res.data.createdTime!));
    }

    // Формуємо унікальні дати (тільки рік-місяць-день)
    const uniqueDateKeys = new Set<string>();
    const uniqueDates = [];

    for (const date of allDates) {
      const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const key = day.toISOString();
      if (!uniqueDateKeys.has(key)) {
        uniqueDateKeys.add(key);
        uniqueDates.push(key); // зберігаємо як ISO-строку
      }
    }

    return NextResponse.json({ dates: uniqueDates });
  } catch (error) {
    console.error("Error getting available dates:", error);
    return NextResponse.json(
      { error: "Failed to get dates: " + (error as Error).message },
      { status: 500 }
    );
  }
}
