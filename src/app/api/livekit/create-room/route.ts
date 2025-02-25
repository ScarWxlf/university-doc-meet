import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { PrismaClient } from "@prisma/client";

const livekitHost = process.env.LIVEKIT_URL!;
const livekitApiKey = process.env.LIVEKIT_API_KEY!;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET!;

const roomService = new RoomServiceClient(livekitHost, livekitApiKey, livekitApiSecret);
const prisma = new PrismaClient();
export async function POST(req: Request) {
  try {
    const { roomName } = await req.json();

    const meeting = await prisma.meeting.findUnique({
      where: { roomName: roomName },
    });
    const now = new Date();
    const meetingStart = new Date(meeting!.date);
    const fiveMinutesBeforeStart = new Date(meetingStart.getTime() - 5 * 60 * 1000);
    const oneHourAfterStart = new Date(meetingStart.getTime() + 60 * 60 * 1000);

    if (now < fiveMinutesBeforeStart || now > oneHourAfterStart) {
      return NextResponse.json({ error: "Room can only be created 5 minutes before or up to 1 hour after the meeting start time" }, { status: 400 });
    }

    const rooms = await roomService.listRooms();
    if (rooms.some(room => room.name === roomName)) {
      return NextResponse.json({ message: "Room already exists" });
    }

    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 60,
      maxParticipants: 20,
    });

    console.log("Room created:", roomName);
    return NextResponse.json({ message: "Room created successfully" });
  } catch (error) {
    console.error("❌ Error creating room:", error);
    return NextResponse.json({ error: "Error creating room" }, { status: 500 });
  }
}
