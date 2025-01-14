import { NextResponse } from "next/server";
import { drive } from "@/lib/google";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const { fileId, content, mimeType } = await req.json();

    if( mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
      const docxBuffer = Readable.from(Buffer.from(content, "base64"));
      await drive.files.update({
        fileId,
        media: {
          mimeType,
          body: docxBuffer,
        },
      });
    } else{
      await drive.files.update({
        fileId,
        media: {
          mimeType,
          body: content,
        },
      });
    }

    return NextResponse.json({ message: "File updated successfully" });
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json({ error: "Error updating file" }, { status: 500 });
  }
}
