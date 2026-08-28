"use server";

import { prisma } from "../db";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "./session";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });

  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  const passwordsMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordsMatch) {
    return { success: false, error: "Invalid email or password." };
  }

  await createSession(user.id, user.email, user.name);
  return { success: true };
}

export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = RegisterSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: parsed.data.name?.trim() || null,
      passwordHash,
    },
  });

  await createSession(user.id, user.email, user.name);
  return { success: true };
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
