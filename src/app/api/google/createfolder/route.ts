import { NextResponse } from "next/server";
import { drive } from "@/lib/google";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const rootFolderId = process!.env!.ROOT_FOLDER!;
    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents and name = 'user-${userId}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      return NextResponse.json({ folderId: response.data.files[0].id });
    }

    const folderMetadata = {
      name: `user-${userId}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });

    return NextResponse.json({ folderId: folder.data.id });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
