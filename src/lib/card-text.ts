import { z } from "zod";
export const defaultCardText = { ribbon: "You & Me", heading: "Our days, kept close.", message: "Every little day, a little more us." };
export const cardTextInput = z.object({
  ribbon: z.string().trim().min(1).max(32),
  heading: z.string().trim().min(1).max(70),
  message: z.string().trim().min(1).max(160),
});
export type CardText = z.infer<typeof cardTextInput>;
