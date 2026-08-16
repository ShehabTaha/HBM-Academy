import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/services/email.service";
import { resolveAvatarUrl } from "@/lib/avatar";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(120),
  language: z.enum(["en", "ar"]).default("en"),
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
        language: parsed.data.language,
        avatar_url: resolveAvatarUrl(null),
      },
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  sendEmail({
    to: parsed.data.email,
    subject: "Welcome to HBM Academy",
    html: `<p>Hi ${parsed.data.name},</p><p>Welcome to HBM Academy. Confirm your email to begin learning.</p>`,
    text: "Welcome to HBM Academy. Confirm your email to begin learning.",
    userId: data.user?.id,
    templateKey: "welcome_email",
  }).catch(() => undefined);

  return NextResponse.json({ user: data.user });
}
