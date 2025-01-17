import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { drive } from "@/lib/google";

const prisma = new PrismaClient();

export async function POST(req: Request){
    const { fileId } = await req.json();
    try {
        await prisma.document.delete({
            where: {
                googleId: fileId
            }  
        })
        await drive.files.delete({
            fileId: fileId
        })
        return NextResponse.json({ message: "File deleted successfully"}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting file"+ (error as Error).message }, { status: 500 });
    }
}