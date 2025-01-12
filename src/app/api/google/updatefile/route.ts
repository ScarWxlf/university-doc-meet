import { NextResponse } from "next/server";
import { drive } from "@/lib/google";

export async function POST(req: Request) {
  try {
    const { fileId, content } = await req.json();

    await drive.files.update({
      fileId,
      media: {
        mimeType: "text/plain",
        body: content,
      },
    });

    return NextResponse.json({ message: "File updated successfully" });
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json({ error: "Error updating file" }, { status: 500 });
  }
}
