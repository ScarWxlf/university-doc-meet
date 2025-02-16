import { NextResponse } from "next/server";
import { drive } from "@/lib/google";
import { Readable } from "stream";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { fileName, mimeType, content, userId } = await req.json();

    const folderResponse = await drive.files.list({
      q: `name = 'user-${userId}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id)",
    });

    const userFolder = folderResponse.data.files?.[0];
    if (!userFolder) {
      throw new Error("User folder not found.");
    }

    const fileMetadata = {
      name: fileName,
      parents: [userFolder!.id!],
    };

    const media = {
      mimeType,
      body: Readable.from(Buffer.from(content, "base64")),
    };

    const uploadResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    await prisma.document.create({
      data: {
        googleId: uploadResponse.data.id!,
        createdById: parseInt(userId)
    }})

    return NextResponse.json({ fileName: fileName });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
