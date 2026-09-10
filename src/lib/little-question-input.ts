import { z } from "zod";

export const littleQuestionActionInput = z.object({
  roundId: z.uuid(),
  intent: z.enum(["answer", "request-rest", "approve-rest", "decline-rest"]),
  body: z.string().trim().max(1200).optional(),
});

export type LittleQuestionActionState = { message: string };
