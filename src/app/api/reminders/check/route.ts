import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushNotificationToUser } from "@/lib/notifications/push";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();

  // Find all due reminders across all users
  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: { in: ["PENDING", "SNOOZED"] },
      remindAt: { lte: now },
      isPushSent: false,
    },
    take: 50,
  });

  let sentCount = 0;

  for (const rem of dueReminders) {
    try {
      await sendPushNotificationToUser(rem.userId, {
        title: `⏰ Reminder: ${rem.title}`,
        body: rem.description || "Scheduled task reminder from DOTO",
        url: `/todos?highlight=${rem.todoId || rem.id}`,
        id: rem.id,
      });

      await prisma.reminder.update({
        where: { id: rem.id },
        data: { isPushSent: true },
      });

      sentCount++;
    } catch (e) {
      console.error("Error processing reminder notification:", rem.id, e);
    }
  }

  return NextResponse.json({
    success: true,
    processed: dueReminders.length,
    sent: sentCount,
    timestamp: now.toISOString(),
  });
}
