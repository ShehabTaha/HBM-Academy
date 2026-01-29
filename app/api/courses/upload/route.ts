import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { uploadCourseThumbnail } from "@/lib/services/storage.service";

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const courseId = formData.get("courseId") as string;

    if (!file || !courseId) {
      return NextResponse.json(
        { error: "File and courseId are required" },
        { status: 400 },
      );
    }

    // Server-side upload uses Admin Client (via modified StorageService)
    const result = await uploadCourseThumbnail(courseId, file);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
