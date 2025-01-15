import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const { userSharedEmail, userId, fileId } = await req.json();
    try {
        const user = await prisma.user.findUnique({ where: { email: userSharedEmail } });
        if (!user) {
            throw new Error("User not found.");
        }

        const file = await prisma.document.findUnique({ where: { googleId: fileId } });
        if (!file) {
            throw new Error("File not found.");
        }


        await prisma.fileShare.create({
            data:{
                documentId: fileId,
                userEmail: userSharedEmail,
                userOwnerId: parseInt(userId)
            }
        })

        return NextResponse.json({ message: "File shared successfully." });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}