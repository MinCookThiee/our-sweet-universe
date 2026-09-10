import { z } from "zod";

export const inviteEmailInput = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
});

export const inviteTokenInput = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, "This invite link is not valid.");

export const partnerSignupInput = z.object({
  token: inviteTokenInput,
  name: z.string().trim().min(1, "Enter your name.").max(100),
  password: z.string().min(12, "Use at least 12 characters.").max(128),
  confirmation: z.string(),
}).refine((value) => value.password === value.confirmation, {
  path: ["confirmation"],
  message: "Passwords do not match.",
});

export type InviteActionState = { message: string; link?: string; created?: boolean };
