import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = emailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: (validation as any).error.errors[0].message },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    // Create Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check if email is already taken
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use by another account" },
        { status: 409 },
      );
    }

    // Update email
    const { error: updateError } =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("users") as any)
        .update({ email: email })
        .eq("id", session.user.id);

    if (updateError) {
      console.error("Error updating email:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error: any) {
    console.error("[Email Change API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 },
    );
  }
}
