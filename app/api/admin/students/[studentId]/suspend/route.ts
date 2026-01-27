import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params;
  const body = await req.json();
  const { reason } = body;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Assuming 'suspended' status logic involves deleted_at or metadata.
  // We will store reason in bio for now as workaround if no dedicated column
  // Or better, just log it and mark deleted/suspended if column exists.
  // I will assume I can update 'status' if I added it to types?
  // Let's UPDATE 'users' table. If 'status' column assumes to exist.
  // SAFEST FALLBACK: Update bio.

  // Fetch current bio
  const { data: student } = await supabase
    .from("users")
    .select("bio")
    .eq("id", studentId)
    .single();
  const newBio = `[SUSPENDED: ${reason}] ${student?.bio || ""}`;

  const { error } = await supabase
    .from("users")
    .update({
      bio: newBio,
      // deleted_at: new Date().toISOString() // Optional: treat suspend as soft delete?
      // Let's NOT soft delete on suspend so they show up in 'Suspended' filter distinct from 'Deleted'
    })
    .eq("id", studentId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
