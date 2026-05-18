import { z } from "zod";

const imageSourceSchema = z.string().min(1).refine(
  (value) => value.startsWith("data:image/") || /^https?:\/\//.test(value),
  "Image must be a valid data URL or remote URL"
);

export const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  image_url: imageSourceSchema,
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  location_wilaya: z.string().min(1).max(100),
  location_maps_link: z.string().url(),
  max_participants: z.number().int().positive(),
  age_range: z.string().max(50).optional(),
  spots_taken: z.number().int().min(0).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().min(10).optional(),
  image_url: imageSourceSchema.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  location_wilaya: z.string().min(1).max(100).optional(),
  location_maps_link: z.string().url().optional(),
  max_participants: z.number().int().positive().optional(),
  age_range: z.string().max(50).nullable().optional(),
  spots_taken: z.number().int().min(0).optional(),
});
