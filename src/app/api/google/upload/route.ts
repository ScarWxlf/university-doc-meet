import { NextResponse } from "next/server";
import { drive } from "@/lib/google";
import { Readable } from "stream";

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

    // const uploadResponse =
    await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    // const fileid = uploadResponse.data.id;

    return NextResponse.json({ fileName: fileName });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
