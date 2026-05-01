import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  // Verify the email belongs to the user
  const { data: targetEmail, error: fetchError } = await supabase
    .from("user_emails")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !targetEmail) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  // Count user emails
  const { count } = await supabase
    .from("user_emails")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count <= 1) {
    return NextResponse.json(
      { error: "Cannot delete your only email address" },
      { status: 400 }
    );
  }

  // If primary, promote another verified email
  if (targetEmail.is_primary) {
    const { data: alternativeEmails } = await supabase
      .from("user_emails")
      .select("*")
      .eq("user_id", userId)
      .neq("id", id)
      .eq("is_verified", true)
      .limit(1);

    if (!alternativeEmails || alternativeEmails.length === 0) {
      return NextResponse.json(
        { error: "Please verify another email before deleting the primary one" },
        { status: 400 }
      );
    }

    const newPrimary = alternativeEmails[0];

    // Promote new primary
    await supabase
      .from("user_emails")
      .update({ is_primary: true })
      .eq("id", newPrimary.id);

    // Sync to users table
    await supabase
      .from("users")
      .update({ email: newPrimary.email })
      .eq("id", userId);
  }

  // Delete the email
  const { error: deleteError } = await supabase
    .from("user_emails")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
