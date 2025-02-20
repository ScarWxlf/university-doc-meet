import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    // const now = new Date();
    // now.setHours(now.getHours() - 1);

    // await prisma.meeting.deleteMany({
    //   where: {
    //     date: {
    //       lt: now,
    //     },
    //   },
    // });

    const response = await prisma.meeting.findMany({
        where: {
            createdById: parseInt(userId),
        }
    });

    const sharedMeetings = await prisma.meeting.findMany({
        where: {
            invitedEmails: {
                has: email,
            },
        },
    });

    const meetings = [...response, ...sharedMeetings];
    meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return NextResponse.json({ meetings });
  } catch (error) {
    return NextResponse.json({ error: "Error getting meetings: " + (error as Error).message }, { status: 500 });
  }
}
