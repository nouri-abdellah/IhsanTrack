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

export const registerSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["donor", "volunteer"]).optional(),
  phone: z.string().min(8).max(20),
});

export const registerAssociationSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().min(8).max(20),
  social_number: z.string().min(2).max(100),
  name: z.string().min(2).max(200),
  description: z.string().min(10),
  logo_url: imageSourceSchema,
  wilaya: z.string().min(1).max(100),
  Maps_link: z.string().url(),
  phone_number: z.string().min(8).max(20),
  fields: z.array(associationFieldSchema).min(1).max(10),
  social_media_links: socialLinksSchema.optional(),
  opening_hours: z.string().max(255).optional(),
  agreed_to_tos: z.literal(true),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const checkEmailSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6).max(100),
});

export const verifyRegistrationCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

export const resendRegistrationCodeSchema = z.object({
  email: z.string().email(),
});
