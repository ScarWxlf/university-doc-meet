import { NextResponse } from "next/server";
import { drive } from "@/lib/google";

export async function POST(req: Request) {
  try {
    const { fileId } = await req.json();

    await drive.permissions.create({
      fileId,
      requestBody: {
        type: "anyone",
        role: "reader",
      },
    });

    const response = await drive.files.get(
      {
        fileId,
        fields: "webContentLink",
      },
      { responseType: "json" }
    );

    const downloadUrl = response.data.webContentLink;

    if (!downloadUrl) {
      return NextResponse.json({ error: "File is not available for download" }, { status: 400 });
    }

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error("Error getting download URL:", error);
    return NextResponse.json({ error: "Error getting download URL" }, { status: 500 });
  }
}
