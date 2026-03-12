import { z } from "zod";

export const createEventSchema = z.object({
  association_id: z.number().int().positive(),
  title: z.string().min(2).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be HH:MM or HH:MM:SS"),
  spots_total: z.number().int().positive(),
});

export const updateEventSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be HH:MM or HH:MM:SS").optional(),
  spots_total: z.number().int().positive().optional(),
});
