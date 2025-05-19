import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { drive } from "@/lib/google";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Readable } from "stream";
import { sendEmailReport } from "@/lib/email.mjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const event = await req.json();
    console.log(event);
    if (!event || typeof event !== "object") {
      throw new Error("Invalid webhook payload");
    }

    
    if(event.event === "room_started") {
      const eventExists = await prisma.meetingStats.findFirst({
        where: {
          roomName: event.room.name,
        }
      });
      
      if (eventExists) {
        console.log(`⚠️ Duplicate event ignored: ${event.event}`);
        return NextResponse.json({ message: "Duplicate event ignored" });
      }

      const meeting = await prisma.meeting.findUnique({
        where: { roomName: event.room.name },
      });

      if(!meeting) {
        console.log(`⚠️ Meeting not found for room: ${event.room.name}`);
        return NextResponse.json({ message: "Meeting not found" });
      }

      await prisma.meetingStats.create({
        data: {
          createdById: meeting!.createdById,
          roomName: event.room.name,
          events: [],
        }
      });
    }

    if (event.event === "participant_joined" || event.event === "participant_left") {
      const meetingStats = await prisma.meetingStats.findUnique({
        where: { roomName: event.room.name },
        select: { events: true },
      });
    
      const now = new Date()
    
      const newEvent = {
        timestamp: now,
        event: event.event,
        participant: { id: event.participant.identity, name: event.participant.name },
      };
    
      await prisma.meetingStats.update({
        where: { roomName: event.room.name },
        data: {
          events: Array.isArray(meetingStats?.events) ? [...meetingStats!.events, newEvent] : [newEvent],
        },
      });
    }

    if (event.event === "room_finished") {
      const updated = await prisma.meetingStats.updateMany({
        where: {
          roomName: event.room.name,
          reportGenerated: false,
        },
        data: {
          reportGenerated: true,
        },
      });

      if (updated.count === 0) {
        console.log(`⚠️ Duplicate room_finished ignored for ${event.room.name}`);
        return NextResponse.json({ message: "Already processed" });
      }

      const meetingStats = await prisma.meetingStats.findUnique({
        where: { roomName: event.room.name },
      });

      const formattedMeetingStats: meetingStats = {
        ...meetingStats!,
        events: (meetingStats!.events as unknown as Event[]) || [],
      };

      await generateMeetingReport(formattedMeetingStats);
    }

    return NextResponse.json({ message: "Event logged" });
  } catch (error) {
    console.log("❌ Error handling webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

interface Event {
  timestamp: string;
  event: string;
  participant: { id: string; name: string };
}

interface meetingStats {
  id: number;
  roomName: string;
  createdById: number;
  events: Event[];
}

const generateMeetingReport = async (meetingStats: meetingStats) => {
  try {
    const { id, createdById, roomName, events } = meetingStats;
    const meeting = await prisma.meeting.findUnique({
      where: { roomName },
    });
    console.log("events", events)

    // TODO: створювати руму при створенні мітингу, фіксувати всі події і потім фільтрувати тільки від початку мітингу до його кінця

    const participantsMap = new Map();

    events.forEach((event: Event) => {
      const { participant, timestamp } = event;
      if (!participantsMap.has(participant.id)) {
        participantsMap.set(participant.id, { name: participant.name, joinedAt: null, leftAt: null });
      }

      if (event.event === "participant_joined") {
        participantsMap.get(participant.id).joinedAt = timestamp;
      }
      if (event.event === "participant_left") {
        participantsMap.get(participant.id).leftAt = timestamp;
      }
    });
    const formatToKyiv = (utcString: string) => {
      const date = new Date(utcString);
      return date.toLocaleString("uk-UA", {
        timeZone: "Europe/Kyiv",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(",", "");
    };

    const joinedTimestamps = events
      .filter((e) => e.event === "participant_joined")
      .map((e) => new Date(e.timestamp).getTime());

    const leftTimestamps = events
      .filter((e) => e.event === "participant_left")
      .map((e) => new Date(e.timestamp).getTime());

    const startTime = new Date(Math.min(...joinedTimestamps));
    const endTime = new Date(Math.max(...leftTimestamps));
    const durationMs = endTime.getTime() - startTime.getTime();

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    const durationFormatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `📅 Meeting: ${meeting!.title}`,
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph(`🕒 Date: ${formatToKyiv(meeting!.date.toISOString())}`),
            new Paragraph(`⏳ Duration: ${durationFormatted}`),
            new Paragraph("👥 Participants:\n"),
            ...Array.from(participantsMap.values()).map((p) =>
              new Paragraph(`- ${p.name} (Joined: ${formatToKyiv(p.joinedAt)}, Left: ${formatToKyiv(p.leftAt)})`)
            ),
            new Paragraph("\n📜 Event Logs:\n"),
            ...events.map((e: Event) =>
              new Paragraph(`- ${formatToKyiv(e.timestamp)}: ${e.event} - ${e.participant.name}`)
            ),
          ],
        },
      ],
    });

    const emailText = `📅 Meeting: ${meeting!.title}
      🕒 Date: ${formatToKyiv(meeting!.date.toISOString())}
      ⏳ Duration: ${durationFormatted}

      👥 Participants:
      ${Array.from(participantsMap.values())
        .map(
          (p) =>
            `- ${p.name} (Joined: ${formatToKyiv(p.joinedAt)}, Left: ${formatToKyiv(p.leftAt)})`
        )
        .join("\n")}

      📜 Event Logs:
      ${events
        .map(
          (e) =>
            `- ${formatToKyiv(e.timestamp)}: ${e.event} - ${e.participant.name}`
        )
        .join("\n")}
      `;

    const user = await prisma.user.findUnique({ where: { id: createdById } });

    if (user?.email) {
      await sendEmailReport(
        user.email,
        `Meeting Report: ${meeting!.title}`,
        emailText
      );
    }
    const buffer = await Packer.toBuffer(doc);

    const folderResponse = await drive.files.list({
      q: `name = 'user-${createdById}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id)",
    });

    const userFolder = folderResponse.data.files?.[0];

    const fileMetadata = {
      name: `Report meeting "${meeting!.title}".docx`,
      parents: [userFolder!.id!],
    };

    const media = {
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      body: Readable.from(buffer),
    };

    const createResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    await prisma.document.create({
      data: {
        googleId: createResponse.data.id!,
        createdById: createdById,
      },
    });

    await prisma.meetingStats.delete({ where: { id } });
    await prisma.meeting.delete({ where: { roomName } });

    console.log(`✅ 📊 Report generated for meeting "${meeting!.title}" and saved as .docx`);
  } catch (error) {
    console.log("❌ Error generating meeting report:", error);
  }
};
