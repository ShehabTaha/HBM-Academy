import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      phone,
      location,
      country,
      timezone,
      language,
      company,
      job_title,
      website,
      social_links,
    } = body;

    // Create Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Build update object
    const updateData: any = {};
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (country !== undefined) updateData.country = country;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;
    if (company !== undefined) updateData.company = company;
    if (job_title !== undefined) updateData.job_title = job_title;
    if (website !== undefined) updateData.website = website;
    if (social_links !== undefined) updateData.social_links = social_links;

    // Check if profile exists
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    let result;

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({ user_id: session.user.id, ...updateData })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      profile: result,
    });
  } catch (error: any) {
    console.error("[Personal Details API] Error:", error);

    // Handle case where table doesn't exist
    if (error.code === "PGRST205" || error.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "user_profiles table not found. Please run database migrations.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update personal details" },
      { status: 500 },
    );
  }
}
