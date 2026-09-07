import { z } from "zod";

export const ownerInput = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
  coupleName: z.string().trim().min(1).max(100),
  togetherSince: z.iso.date(),
  timezone: z.string().trim().refine((value) => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; }
    catch { return false; }
  }, "Use an IANA timezone such as Asia/Bangkok"),
});
