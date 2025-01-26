import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

// import { Room, RoomServiceClient } from 'livekit-server-sdk';


const prisma = new PrismaClient();
// const livekitApiKey = process.env.LIVEKIT_API_KEY; // API Key
// const livekitApiSecret = process.env.LIVEKIT_API_SECRET; // API Secret
// const livekitHost = process.env.LIVEKIT_URL;
// const roomService = new RoomServiceClient(livekitHost!, livekitApiKey, livekitApiSecret);

export async function POST(req: Request) {
  try {
    const { userId, date, title, description } = await req.json();
    const roomName = nanoid(10).toLowerCase();
    // const opts = {
    //     name: roomName,
    //     emptyTimeout: 10 * 60, // 10 minutes
    //     maxParticipants: 2,
    //   };
    // roomService.createRoom(opts).then((room: Room) => {
    //     console.log('room created', room);
    // });
    await prisma.meeting.create({
      data: {
        title,
        description,
        date,
        roomName,
        createdById: parseInt(userId),
      },
    });
    return NextResponse.json({ message: "Meeting created" });
  } catch (error) {
    return NextResponse.json({ error: "Error creating meeting: " + (error as Error).message }, { status: 500 });
  }
}
