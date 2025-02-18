import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const event = await req.json();
    console.log(event)
    if (event.event === "participant_joined") {
      console.log("Participant joined:", event.participant.name);
    } else if (event.event === "participant_left") {
      console.log("Participant left:", event.participant.name);
    }

    return NextResponse.json({ message: "Event recorded" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json({ error: "Error handling webhook" }, { status: 500 });
  }
}
