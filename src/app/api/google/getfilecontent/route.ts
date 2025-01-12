import { NextResponse } from "next/server";
import { drive } from "@/lib/google";

export async function POST(req: Request) {
  try {
    const { fileId } = await req.json();

    const response = await drive.files.get({
      fileId,
      alt: "media",
    });

    const metadata = await drive.files.get({
      fileId,
      fields: "name",
    });
    // console.log(response.data);

    return NextResponse.json({
      content: response.data,
      name: metadata.data.name,
    });
  } catch (error) {
    console.error("Error fetching file content:", error);
    return NextResponse.json({ error: "Error fetching file content" }, { status: 500 });
  }
}
