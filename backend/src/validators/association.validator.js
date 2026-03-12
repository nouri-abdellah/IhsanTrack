import { z } from "zod";

export const createAssociationSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  wilaya: z.string().min(1).max(100),
});

export const updateAssociationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  wilaya: z.string().min(1).max(100).optional(),
  is_verified: z.boolean().optional(),
});
