import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";


const livekitHost = process.env.LIVEKIT_URL!;
const livekitApiKey = process.env.LIVEKIT_API_KEY!;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET!;

const roomService = new RoomServiceClient(livekitHost, livekitApiKey, livekitApiSecret);

export async function GET(req: Request) {
    const rooms = await roomService.listRooms();
    return NextResponse.json(rooms);
}