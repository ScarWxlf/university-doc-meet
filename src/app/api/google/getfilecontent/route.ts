import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { Readable } from "stream";
import { drive } from "@/lib/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}


export async function POST(req: Request) {
  try {
    const { fileId, userId, userEmail } = await req.json();
    if(!userId){
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const fileOwner = await prisma.document.findFirst({
      where: {
        googleId: fileId,
        createdById: parseInt(userId)
      }
    });
    const fileShared = await prisma.fileShare.findFirst({
      where: {
        documentId: fileId,
        userEmail: userEmail
      }
    });
    console.log(fileShared)
    if(fileOwner === null && fileShared === null){
      return NextResponse.redirect(new URL("/", req.url));
    }

    const isOwner = fileOwner !== null;
    const response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );
    const metadata = await drive.files.get({
      fileId,
      fields: "name, mimeType",
    });
    // console.log(response.data);

    const mimeType = metadata.data.mimeType;

    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const fileBuffer = await streamToBuffer(response.data);

      const htmlContent = await mammoth.convertToHtml({ buffer: fileBuffer });

      console.log(htmlContent);
      return NextResponse.json({
        content: htmlContent.value,
        name: metadata.data.name,
        isOwner,
        mimeType,
      });
    }

    const fileBuffer = await streamToBuffer(response.data);

    return NextResponse.json({
      content: fileBuffer.toString("utf-8"),
      name: metadata.data.name,
      isOwner,
      mimeType,
    });
  } catch (error) {
    console.log("Error fetching file content:", error);
    return NextResponse.json({ error: "Error fetching file content" }, { status: 500 });
  }
}
