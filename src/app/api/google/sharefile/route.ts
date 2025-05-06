import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const { emails, userId, fileId } = await req.json();
  
    try {
      const file = await prisma.document.findUnique({ where: { googleId: fileId } });
      if (!file) {
        throw new Error("File not found.");
      }
  
      for (const email of emails) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) continue;
  
        const alreadyShared = await prisma.fileShare.findFirst({
          where: { documentId: fileId, userEmail: email },
        });
  
        if (!alreadyShared) {
          await prisma.fileShare.create({
            data: {
              documentId: fileId,
              userEmail: email,
              userOwnerId: parseInt(userId),
            },
          });
        }
      }
  
      return NextResponse.json({ message: "File shared successfully." });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }