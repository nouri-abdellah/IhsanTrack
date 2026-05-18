import { z } from "zod";

const imageSourceSchema = z.string().min(1).refine(
  (value) => value.startsWith("data:image/") || /^https?:\/\//.test(value),
  "Image must be a valid data URL or remote URL"
);

const associationFieldSchema = z.enum([
  "relief",
  "education",
  "health",
  "orphans",
  "ramadan",
  "food",
  "winter",
  "medical",
  "shelter",
  "community",
]);

const socialLinksSchema = z
  .object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional(),
  })
  .strict();

export const createAssociationSchema = z.object({
  social_number: z.string().min(2).max(100),
  name: z.string().min(2).max(200),
  description: z.string().min(10),
  logo_url: imageSourceSchema,
  cover_image_url: imageSourceSchema.optional(),
  wilaya: z.string().min(1).max(100),
  Maps_link: z.string().url(),
  phone_number: z.string().min(8).max(20),
  fields: z.array(associationFieldSchema).min(1).max(10),
  social_media_links: socialLinksSchema.optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  twitter: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
  opening_hours: z.string().max(255).optional(),
  agreed_to_tos: z.literal(true),
});

export const updateAssociationSchema = z.object({
  social_number: z.string().min(2).max(100).optional(),
  name: z.string().min(2).max(200).optional(),
  description: z.string().min(10).optional(),
  logo_url: imageSourceSchema.optional(),
  cover_image_url: imageSourceSchema.optional(),
  wilaya: z.string().min(1).max(100).optional(),
  Maps_link: z.string().url().optional(),
  phone_number: z.string().min(8).max(20).optional(),
  fields: z.array(associationFieldSchema).min(1).max(10),
  social_media_links: socialLinksSchema.optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  twitter: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
  opening_hours: z.string().max(255).optional(),
  agreed_to_tos: z.boolean().optional(),
});
