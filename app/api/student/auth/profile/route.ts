import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStudent } from "@/lib/services/student.service";
import { normalizeLanguage } from "@/lib/i18n";
import { resolveAvatarUrl } from "@/lib/avatar";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  bio: z.string().max(1000).nullable().optional(),
  specialization: z
    .enum(["f_and_b", "housekeeping", "front_office", "management", "culinary"])
    .nullable()
    .optional(),
  language: z.enum(["en", "ar"]).optional(),
});

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ student });
}

export async function PATCH(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = updateProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid profile data" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await (supabase.from("users") as any)
    .update({
      ...parsed.data,
      language: parsed.data.language
        ? normalizeLanguage(parsed.data.language)
        : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", student.id)
    .select("id,email,name,avatar,bio,specialization,language,supabase_uid")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    student: {
      ...data,
      avatar: resolveAvatarUrl(data.avatar),
      language: normalizeLanguage(data.language),
    },
  });
}
