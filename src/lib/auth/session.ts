import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "../db";

const secretKey = process.env.AUTH_SECRET || "doto-super-secret-developer-work-os-key-32chars";
const key = new TextEncoder().encode(secretKey);

export const SESSION_COOKIE_NAME = "doto_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string | null;
  expiresAt: Date;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function decrypt(sessionToken: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(sessionToken, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as { userId: string; email: string; name?: string | null };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, email: string, name?: string | null) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const sessionToken = await encrypt({ userId, email, name, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Cookie belongs to a deleted user or previous DB
      try {
        await deleteSession();
      } catch {
        // Ignore cookie store errors in read-only phases
      }
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
