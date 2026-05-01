import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  // Verify the email belongs to the user and is verified
  const { data: targetEmail, error: fetchError } = await supabase
    .from("user_emails")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !targetEmail) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  if (!targetEmail.is_verified) {
    return NextResponse.json(
      { error: "You can only set a verified email as primary." },
      { status: 400 }
    );
  }

  if (targetEmail.is_primary) {
    return NextResponse.json({ success: true, message: "Already primary" });
  }

  // 1. Unset all current primaries for this user
  await supabase
    .from("user_emails")
    .update({ is_primary: false })
    .eq("user_id", userId);

  // 2. Set new primary
  const { error: updateError } = await supabase
    .from("user_emails")
    .update({ is_primary: true })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, email: targetEmail.email });
}
