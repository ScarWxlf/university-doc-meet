import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("meetingId");

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(meetingId) },
      select: { invitedEmails: true },
    });

    const users = await prisma.user.findMany({
      where: {
        email: {
          in: meeting!.invitedEmails,
        },
      },
      select: {
        name: true,
        image: true,
        email: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ participants: users });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Error fetching participants" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { meetingId, email } = await req.json();

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    });
    const userOwnerEmail = await prisma.user.findUnique({
      where: { id: meeting?.createdById },
      select: { email: true },
    });
    if (userOwnerEmail?.email === email) {
      return NextResponse.json(
        { error: "You cannot add yourself as a participant" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        invitedEmails: {
          push: email,
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        meetingId,
        message: `You have been invited to the meeting.`,
      },
    });

    return NextResponse.json({ message: "Participant added successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error adding participant" + (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { meetingId, email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { invitedEmails: true },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        invitedEmails: {
          set: meeting.invitedEmails.filter((curEmail: string) => curEmail !== email),
        },
      },
    });

    return NextResponse.json({ message: "Participant removed successfully" });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: "Error removing participant" },
      { status: 500 }
    );
  }
}
