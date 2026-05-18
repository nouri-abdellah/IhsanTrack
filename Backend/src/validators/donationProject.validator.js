import { z } from "zod";

const imageSourceSchema = z.string().min(1).refine(
  (value) => value.startsWith("data:image/") || /^https?:\/\//.test(value),
  "Image must be a valid data URL or remote URL"
);

export const createDonationProjectSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  domain: z.string().min(2).max(100).optional().default("عام"),
  image_url: imageSourceSchema,
  goal_amount: z.number().positive(),
  current_amount: z.number().min(0).optional(),
  max_date: z.string().datetime().refine((value) => new Date(value) > new Date(), "Campaign date must be in the future").optional(),
});

export const updateDonationProjectSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().min(10).optional(),
  domain: z.string().min(2).max(100).optional(),
  image_url: imageSourceSchema.optional(),
  goal_amount: z.number().positive().optional(),
  current_amount: z.number().min(0).optional(),
  max_date: z.string().datetime().refine((value) => new Date(value) > new Date(), "Campaign date must be in the future").nullable().optional(),
});
