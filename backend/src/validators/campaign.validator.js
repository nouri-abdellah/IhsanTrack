import { z } from "zod";

export const createCampaignSchema = z.object({
  association_id: z.number().int().positive(),
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  goal_amount: z.number().positive(),
  category: z.enum(["Health", "Education", "Food", "Emergency", "Mosque", "Orphans"]),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  goal_amount: z.number().positive().optional(),
  category: z.enum(["Health", "Education", "Food", "Emergency", "Mosque", "Orphans"]).optional(),
  status: z.enum(["active", "completed", "paused"]).optional(),
});
