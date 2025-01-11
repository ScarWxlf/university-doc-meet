import { drive } from "@/lib/google";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const rootFolderId = process!.env!.ROOT_FOLDER!;

    const folderResponse = await drive.files.list({
      q: `'${rootFolderId}' in parents and name = 'user-${userId}'`,
    });

    const userFolderId = folderResponse.data.files?.[0]?.id;

    const response = await drive.files.list({
      q: `'${userFolderId}' in parents`,
      fields: "files(id, name, mimeType, createdTime, modifiedTime)",
    });

    return NextResponse.json({ files: response.data.files });
  } catch (error) {
    console.error("Error creating file on Google Drive:", error);
    return NextResponse.json({ error: "Error creating file" }, { status: 500 });
  }
}
