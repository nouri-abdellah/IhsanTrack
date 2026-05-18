import { z } from "zod";

export const createDonationSchema = z.object({
  donation_project_id: z.number().int().positive(),
  amount: z.number().positive(),
  payment_method: z.string().min(1).max(50),
  anonymous: z.boolean().optional(),
});
