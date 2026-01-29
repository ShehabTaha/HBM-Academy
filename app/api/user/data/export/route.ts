import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const supabase = createAdminClient();

    // Fetch user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    // Fetch user sessions
    const { data: sessions } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", session.user.id);

    // Fetch basic user info (if access to auth.users is needed, we might need admin generic client users.list logic finding by id)
    // For now we'll just return what we have in public tables.

    const userData = {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      profile,
      sessions,
      exportDate: new Date().toISOString(),
    };

    if (format === "csv") {
      // Simple CSV flattening for profile
      const flatProfile = profile
        ? Object.entries(profile)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")
        : "";
      const csvContent = `User ID,Email,Name,Profile Data\n${userData.user.id},${userData.user.email},${userData.user.name},"${flatProfile}"`;

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="user-data-${session.user.id}.csv"`,
        },
      });
    }

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error("[Data Export API] Error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
