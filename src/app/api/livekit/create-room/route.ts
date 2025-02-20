import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

const livekitHost = process.env.LIVEKIT_URL!;
const livekitApiKey = process.env.LIVEKIT_API_KEY!;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET!;

const roomService = new RoomServiceClient(livekitHost, livekitApiKey, livekitApiSecret);

export async function POST(req: Request) {
  try {
    const { roomName } = await req.json();

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
