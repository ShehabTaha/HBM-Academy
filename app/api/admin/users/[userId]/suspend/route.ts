import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const { reason } = await req.json();
  const supabase = createAdminClient();

  // Suspend user by setting deleted_at (soft delete)
  // You could also add a separate 'status' or 'suspension_reason' column
  const { error } = await supabase
    .from("users")
    .update({
      deleted_at: new Date().toISOString(),
      // If you have a suspension_reason column, add it here:
      // suspension_reason: reason,
    })
    .eq("id", userId);

  if (error) {
    console.error("Suspend user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
