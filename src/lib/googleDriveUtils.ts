'use server'
import { drive } from "@/lib/google";

const rootFolderId = process.env.ROOT_FOLDER!;

export async function createUserFolderIfNotExists(userId: string) {
  try {
    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents and name = 'user-${userId}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
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

    return folder.data.id;
  } catch (error) {
    return { error: (error as Error).message };
  }
}