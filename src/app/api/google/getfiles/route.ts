import { drive } from "@/lib/google";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Функція для створення діапазону дат з рядка дати
function getDateRange(dateString: string) {
  // Парсимо дату у форматі YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Створюємо початок та кінець дня в UTC
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  
  return {
    formattedStart: startOfDay.toISOString(),
    formattedEnd: endOfDay.toISOString()
  };
}

// Функція для перевірки чи файл створений в обрану дату
function isFileCreatedOnDate(fileCreatedTime: string, targetDateString: string): boolean {
  const fileDate = new Date(fileCreatedTime);
  const [year, month, day] = targetDateString.split('-').map(Number);
  
  return (
    fileDate.getFullYear() === year &&
    fileDate.getMonth() === month - 1 && // month в Date є 0-based
    fileDate.getDate() === day
  );
}

export async function POST(req: Request) {
  try {
    const { userId, userEmail, documentType, searchName, selectedDate } =
      await req.json();
    const rootFolderId = process!.env!.ROOT_FOLDER!;
    
    console.log('Received selectedDate:', selectedDate);
    
    let formattedStart = "", formattedEnd = "";
    if (selectedDate) {
      const { formattedStart: start, formattedEnd: end } = getDateRange(selectedDate);
      formattedStart = start;
      formattedEnd = end;
      
      console.log('Date range:', { formattedStart, formattedEnd });
    }

    if (documentType === "my") {
      const folderResponse = await drive.files.list({
        q: `'${rootFolderId}' in parents and name = 'user-${userId}'`,
      });

      const userFolderId = folderResponse.data.files?.[0]?.id;
      const queryParts = [`'${userFolderId}' in parents`, `trashed=false`];
      
      if (searchName) {
        queryParts.push(`name contains '${searchName}'`);
      }
      
      if (selectedDate) {
        queryParts.push(
          `createdTime >= '${formattedStart}' and createdTime <= '${formattedEnd}'`
        );
      }

      const query = queryParts.join(" and ");
      console.log('Google Drive query:', query);
      
      const response = await drive.files.list({
        q: query,
        fields: "files(id, name, mimeType, createdTime, modifiedTime)",
      });
      
      const user = await prisma.user.findFirst({
        where: {
          id: parseInt(userId),
        }
      });
      
      const files = response.data.files?.map((file) => ({
        ...file,
        userOwnerEmail: user?.email, 
      }));
      
      console.log('Found files count:', files?.length);
      console.log('Files created times:', files?.map(f => ({ name: f.name, createdTime: f.createdTime })));
      
      return NextResponse.json({ files: files });
      
    } else {
      // Обробка shared файлів
      if (!userEmail) {
        return NextResponse.json({ files: [] });
      }
      
      const sharedFiles = await prisma.fileShare.findMany({
        where: {
          userEmail: userEmail,
        },
        include: {
          owner: {
            select: {
              email: true,
            }
          }
        }
      });

      const responses = await Promise.all(
        sharedFiles.map((fileId) =>
          drive.files.get({
            fileId: fileId.documentId,
            fields: "id, name, mimeType, createdTime, modifiedTime",
          })
        )
      );

      let files = responses.map((response, index) => ({
        ...response.data,
        userOwnerId: sharedFiles[index].userOwnerId.toString(),
        userOwnerEmail: sharedFiles[index].owner.email,
      }));

      // Фільтрація за назвою
      if (searchName) {
        files = files.filter((file) =>
          file!.name!.toLowerCase().includes(searchName.toLowerCase())
        );
      }

      // Фільтрація за датою
      if (selectedDate) {
        console.log('Filtering shared files by date:', selectedDate);
        
        files = files.filter((file) => {
          if (!file.createdTime) return false;
          
          const matches = isFileCreatedOnDate(file.createdTime, selectedDate);
          console.log(`File ${file.name} (${file.createdTime}) matches date ${selectedDate}:`, matches);
          
          return matches;
        });
        
        console.log('Filtered shared files count:', files.length);
      }

      return NextResponse.json({ files: files });
    }
  } catch (error) {
    console.error("Error getting files:", error as Error);
    return NextResponse.json({ 
      error: "Error getting files: " + (error as Error).message 
    }, { status: 500 });
  }
}