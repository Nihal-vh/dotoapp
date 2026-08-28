import webpush from "web-push";
import { prisma } from "@/lib/db";

// Configure Web Push with VAPID credentials
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const subject = process.env.VAPID_SUBJECT || "mailto:admin@doto.app";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  id?: string;
}

/**
 * Send a web push notification to all active devices of a user
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushPayload
): Promise<{ successful: number; failed: number }> {
  if (!publicKey || !privateKey) {
    console.warn("VAPID keys are missing, skipping web push dispatch.");
    return { successful: 0, failed: 0 };
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return { successful: 0, failed: 0 };
  }

  let successful = 0;
  let failed = 0;
  const expiredEndpoints: string[] = [];

  const jsonPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/todos",
    icon: payload.icon || "/icon-192x192.png",
    badge: payload.badge || "/icon-192x192.png",
    tag: payload.tag || `doto-remind-${Date.now()}`,
    id: payload.id,
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          jsonPayload
        );
        successful++;
      } catch (err: unknown) {
        failed++;
        // If status is 410 (Gone) or 404 (Not Found), unsubscribe dead endpoint
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  // Clean up invalid or expired subscriptions
  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    });
  }

  return { successful, failed };
}
