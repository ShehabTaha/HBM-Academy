import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Test 1: Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
          details: authError?.message || "No user found",
        },
        { status: 401 },
      );
    }

    // Test 2: Check user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, email, name")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch user data",
          details: userError.message,
          userId: user.id,
        },
        { status: 500 },
      );
    }

    // Test 3: Try to query assignment_submissions table
    const {
      data: submissions,
      error: submissionsError,
      count,
    } = await supabase
      .from("assignment_submissions")
      .select("*", { count: "exact" })
      .limit(5);

    if (submissionsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to query assignment_submissions",
          details: submissionsError.message,
          user: userData,
        },
        { status: 500 },
      );
    }

    // Success - return diagnostic info
    return NextResponse.json({
      success: true,
      message: "All checks passed!",
      user: {
        id: user.id,
        email: (userData as { email: string }).email,
        name: (userData as { name: string }).name,
        role: (userData as { role: string }).role,
      },
      database: {
        tableName: "assignment_submissions",
        recordCount: count,
        sampleRecords: submissions?.length || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
