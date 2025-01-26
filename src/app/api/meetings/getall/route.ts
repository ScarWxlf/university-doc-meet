import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const response = await prisma.meeting.findMany({
        where: {
            createdById: parseInt(userId),
        }
    });
    return NextResponse.json({ meetings: response });
  } catch (error) {
    return NextResponse.json({ error: "Error getting meetings: " + (error as Error).message }, { status: 500 });
  }
}
