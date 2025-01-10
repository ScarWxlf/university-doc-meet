import { NextResponse } from "next/server";
import { drive } from '@/lib/google'

export async function POST(req: Request) {
    const { userId } = await req.json();
    // try {
    //     const { fileName } = await req.json();
        const folderId = process!.env!.ROOT_FOLDER!;
      
    //     // Метадані для файлу
    //     const fileMetadata = {
    //       name: fileName,
    //       parents: [folderId], // ID головної папки для користувачів
    //       mimeType: "application/vnd.google-apps.document", // Тип Google Docs (або замініть на 'text/plain' для текстового файлу)
    //     };
      
    //     // Створення порожнього текстового файлу (без вмісту)
    //     const response = await drive.files.create({
    //       requestBody: fileMetadata,
    //       fields: "id",
    //     });
      
    //     return NextResponse.json({ fileId: response.data.id });
    //   } catch (error) {
    //     console.error("Error creating file on Google Drive:", error);
    //     return NextResponse.json(
    //       { error: "Error creating file" },
    //       { status: 500 }
    //     );
    //}
    const folderMetadata = {
        name: `user-${userId}`,
        mimeType: "application/vnd.google-apps.folder",
        parents: [folderId], // ID головної папки
      };
    
      const response = await drive.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });
    
      return response.data.id;
}
