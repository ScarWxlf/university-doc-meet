import { NextResponse } from "next/server";
import { drive } from "@/lib/google";
import mammoth from "mammoth";

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}


export async function POST(req: Request) {
  try {
    const { fileId } = await req.json();

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
        mimeType,
      });
    }

    const fileBuffer = await streamToBuffer(response.data);

    return NextResponse.json({
      content: fileBuffer.toString("utf-8"),
      name: metadata.data.name,
      mimeType,
    });
  } catch (error) {
    console.error("Error fetching file content:", error);
    return NextResponse.json({ error: "Error fetching file content" }, { status: 500 });
  }
}
