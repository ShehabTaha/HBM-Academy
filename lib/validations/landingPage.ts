import { z } from "zod";

export const HeroBackgroundTypeSchema = z.enum(["image", "color", "gradient"]);

export const HeroGradientSchema = z.object({
  color1: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  color2: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  direction: z.string(),
  angle: z.number().min(0).max(360).optional(),
});

export const HeroImageAdjustmentsSchema = z.object({
  brightness: z.number().min(0).max(200),
  contrast: z.number().min(0).max(200),
  overlayOpacity: z.number().min(0).max(100),
  overlayColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
});

export const FAQSchema = z.object({
  id: z.string(),
  question: z.string().max(200, "Question must be at most 200 characters"),
  answer: z.string().max(1000, "Answer must be at most 1000 characters"),
  order: z.number(),
});

export const ReviewSchema = z.object({
  id: z.string(),
  name: z.string().max(50, "Name must be at most 50 characters"),
  avatar: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500, "Comment must be at most 500 characters"),
  date: z.string().optional(),
});

export const LandingPageSettingsSchema = z.object({
  // Hero Section
  hero_background_type: HeroBackgroundTypeSchema,
  hero_background_image_url: z.string().optional(),
  hero_background_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  hero_gradient: HeroGradientSchema.optional(),
  hero_image_adjustments: HeroImageAdjustmentsSchema.optional(),
  hero_subtitle: z
    .string()
    .max(150, "Subtitle must be at most 150 characters")
    .optional(),
  hero_cta_text: z
    .string()
    .max(50, "CTA text must be at most 50 characters")
    .optional(),
  show_instructor_in_hero: z.boolean().optional(),

  // Content Visibility
  show_overview: z.boolean().optional(),
  show_learning_outcomes: z.boolean().optional(),
  show_curriculum: z.boolean().optional(),
  show_instructor: z.boolean().optional(),
  show_reviews: z.boolean().optional(),
  show_faqs: z.boolean().optional(),

  // Content Arrays
  learning_outcomes: z
    .array(z.string().max(100, "Outcome must be at most 100 characters"))
    .max(8, "Maximum 8 outcomes allowed")
    .optional(),
  faqs: z.array(FAQSchema).optional(),

  // Curriculum Settings
  curriculum_sections_limit: z.number().optional(), // 0 for all, or 2, 3, 5
  curriculum_expand_by_default: z.boolean().optional(),

  // Reviews Settings
  reviews_source: z.enum(["manual", "database"]).default("database").optional(),
  reviews_count: z.number().min(1).max(10).optional(),
  reviews_sort_by: z.enum(["newest", "highest_rating"]).optional(),
  manual_reviews: z.array(ReviewSchema).optional(),

  // Metadata
  updated_at: z.string().optional(),
  updated_by: z.string().optional(),
});

export type LandingPageSettings = z.infer<typeof LandingPageSettingsSchema>;
