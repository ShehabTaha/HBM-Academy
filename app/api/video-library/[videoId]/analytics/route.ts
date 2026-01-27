import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ videoId: string }> },
) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  let user = authUser;

  // Fallback for development if auth is disabled
  if (!user && process.env.NODE_ENV === "development") {
    console.warn("No Supabase user session found, using development fallback");
    user = { id: "00000000-0000-0000-0000-000000000000" } as any;
  } else if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = params;

  try {
    const { data: videoRaw, error } = await supabase
      .from("videos" as any)
      .select(
        `
                usage_count,
                lesson_videos (
                    lesson_id,
                    lessons (
                        title,
                        sections (
                            courses (
                                title
                            )
                        )
                    )
                )
            `,
      )
      .eq("id", videoId)
      .single();

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const video = videoRaw as any;

    // Transform data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessons = video.lesson_videos.map((lv: any) => ({
      lesson_title: lv.lessons?.title || "Unknown Lesson",
      course_title: lv.lessons?.sections?.courses?.title || "Unknown Course",
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueCourses = new Set(lessons.map((l: any) => l.course_title)).size;

    return NextResponse.json({
      usage_count: video.usage_count,
      lessons,
      courses_count: uniqueCourses,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
