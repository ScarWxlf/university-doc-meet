import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") as string);

    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      include: {
        meeting: {
          select: { title: true },
        },
        document: {
          select: { googleId: true },
        },
      },
    });


    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching notifications:" + error }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { notificationId } = await req.json();

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    return NextResponse.json({ error: "Error updating notification:" + error }, { status: 500 });
  }
}