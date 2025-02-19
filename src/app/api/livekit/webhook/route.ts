import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { event, room, participant } = await req.json();

    // Знаходимо мітинг по roomName
    const meeting = await prisma.meeting.findUnique({
      where: { roomName: room.name },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const meetingStart = new Date(meeting.date);
    const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);
    const now = new Date();

    // Перевіряємо, чи подія відбулася в рамках мітингу
    if (now < meetingStart || now > meetingEnd) {
      return NextResponse.json({ message: "Event ignored (outside meeting time)" });
    }

    // Додаємо івент у лог
    const eventLog = {
      timestamp: now.toISOString(),
      event,
      participant: { identity: participant.identity, name: participant.name },
    };

    await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        eventLogs: { push: eventLog }, // Додаємо подію до логів
      },
    });

    return NextResponse.json({ message: "Event logged" });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
