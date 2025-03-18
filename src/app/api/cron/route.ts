import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email.mjs";

const prisma = new PrismaClient();

async function checkMeetings() {
  const now = new Date();
  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

  try {
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        date: {
          gte: now,
          lte: tenMinutesLater,
        },
        reminderSent: false,
      },
      include: { createdBy: true }
    });

    for (const meeting of upcomingMeetings) {
      const meetingDate = meeting.date.toLocaleString();
      const meetingLink = `https://university-doc-meet.vercel.app/rooms/${meeting.roomName}`;

      for (const email of meeting.invitedEmails) {
        await sendEmail(email, `Reminder: Meeting "${meeting.title}"`, meeting.title, meetingDate, meetingLink);
      }

      if (meeting.createdBy?.email) {
        await sendEmail(meeting.createdBy.email, `Reminder: Meeting "${meeting.title}"`, meeting.title, meetingDate, meetingLink);
      }

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { reminderSent: true },
      });
    }
  } catch (error) {
    console.error("Error checking meetings:", error);
  }
}

export async function GET() {
  console.log("🔄 Checking upcoming meetings...");
  await checkMeetings();
  return NextResponse.json({ message: "Meetings checked" });
}
