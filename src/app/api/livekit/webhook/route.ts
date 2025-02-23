import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { drive } from "@/lib/google";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Readable } from "stream";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const event = await req.json();
    console.log(event);

    if(event.event === "room_started") {
      const meeting = await prisma.meeting.findUnique({
        where: { roomName: event.room.name },
      });

      await prisma.meetingStats.create({
        data: {
          createdById: meeting!.createdById,
          roomName: event.room.name,
          events: [],
        }
      });
    }

    const now = new Date();

    if (event.event === "participant_joined" || event.event === "participant_left") {
      const meetingStats = await prisma.meetingStats.findUnique({
        where: { roomName: event.room.name },
        select: { events: true },
      });
    
      const now = new Date().toISOString();
    
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
      const meetingStats = await prisma.meetingStats.findUnique({
        where: { roomName: event.room.name },
      });
      await generateMeetingReport(meetingStats!);
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
            new Paragraph(`🕒 Date: ${meeting!.date.toISOString()}`),
            new Paragraph("👥 Participants:\n"),
            ...Array.from(participantsMap.values()).map((p) =>
              new Paragraph(`- ${p.name} (Joined: ${p.joinedAt}, Left: ${p.leftAt || "Still in meeting"})`)
            ),
            new Paragraph("\n📜 Event Logs:\n"),
            ...events.map((e: Event) =>
              new Paragraph(`- ${e.timestamp}: ${e.event} - ${e.participant.name}`)
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    const folderResponse = await drive.files.list({
      q: `name = 'user-${createdById}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id)",
    });

    const userFolder = folderResponse.data.files?.[0];

    const fileMetadata = {
      name: `${meeting!.title}.docx`,
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

    console.log(`✅ 📊 Report generated for meeting "${meeting!.title}" and saved as .docx`);
  } catch (error) {
    console.log("❌ Error generating meeting report:", error);
  }
};
