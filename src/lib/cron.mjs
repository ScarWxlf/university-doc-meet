import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import {sendEmail} from "./email.mjs";

const prisma = new PrismaClient();

const checkMeetings = async () => {
  const now = new Date();
  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

  try {
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        date: {
          gte: now,
          lte: tenMinutesLater,
        },
      },
      include: { createdBy: true }
    });
    console.log("📅 Upcoming meetings:", upcomingMeetings);
    console.log("🌍 Server Timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  
    for (const meeting of upcomingMeetings) {
      for (const email of meeting.invitedEmails) {
        await sendEmail(
          email,
          `Reminder: Meeting "${meeting.title}"`,
          `Hello, your meeting "${meeting.title}" starts at ${meeting.date.toLocaleTimeString()}.`
        );
      }

      if (meeting.createdBy?.email) {
        await sendEmail(
          meeting.createdBy.email,
          `Reminder: Your Meeting "${meeting.title}"`,
          `Hello, you created a meeting "${meeting.title}" that starts at ${meeting.date.toLocaleTimeString()}.`
        );
      }
    }
    
  } catch (error) {
    console.error("Error checking meetings:", error);
  }
};

cron.schedule("* * * * *", async () => {
  console.log("🔄 Checking upcoming meetings...");
  await checkMeetings();
});

console.log("🚀 Cron job started!");