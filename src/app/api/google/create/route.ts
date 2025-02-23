import { NextResponse } from "next/server";
import { drive } from "@/lib/google";
import { PrismaClient } from "@prisma/client";
import { Document, Packer, Paragraph } from "docx";
import { Readable } from "stream";

const prisma = new PrismaClient();

const extensionMap: Record<string, string> = {
  "text/plain": ".txt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "text/html": ".html",
  "application/json": ".json",
};

export async function POST(req: Request) {
  try {
    const { fileName, userId, mimeType } = await req.json();

    const folderResponse = await drive.files.list({
      q: `name = 'user-${userId}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id)",
    });

    const userFolder = folderResponse.data.files?.[0];
    if (!userFolder) {
      throw new Error("User folder not found.");
    }

    const fileExtension = extensionMap[mimeType] || "";
    const formattedFileName = fileName
      ? `${fileName}${fileExtension}`
      : `New Document${fileExtension}`;

    let fileBuffer: Buffer | undefined;
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const doc = new Document({
        sections: [{ children: [new Paragraph("")] }],
      });
      fileBuffer = await Packer.toBuffer(doc);
    }

    const fileMetadata = {
      name: formattedFileName,
      parents: [userFolder!.id!],
    };

    const media = {
      mimeType,
      body: fileBuffer ? Readable.from(fileBuffer) : "",
    };

    const createResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    const newDocument = await prisma.document.create({
      data: {
        googleId: createResponse.data.id!,
        createdById: parseInt(userId),
      },
    });

    return NextResponse.json({ message: "Document created", document: newDocument });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
