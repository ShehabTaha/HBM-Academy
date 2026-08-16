import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentStudent } from "@/lib/services/student.service";
import { resolveAvatarUrl } from "@/lib/avatar";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No avatar file provided." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, or WebP image." },
        { status: 400 },
      );
    }

    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "Avatar must be smaller than 5MB." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" || file.type === "image/jpg" ? "jpg" : "webp";
    const filePath = `students/${student.id}/avatar-${Date.now()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Student Avatar] Upload failed:", uploadError);
      return NextResponse.json({ error: "Avatar upload failed." }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { data, error: updateError } = await (supabase.from("users") as any)
      .update({ avatar: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", student.id)
      .select("id,email,name,avatar,bio,specialization,language,supabase_uid")
      .single();

    if (updateError) {
      await supabase.storage.from("avatars").remove([filePath]);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await removePreviousAvatar(supabase, student.avatar);

    return NextResponse.json({
      student: {
        ...data,
        avatar: resolveAvatarUrl(data.avatar),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Avatar upload failed.";
    console.error("[Student Avatar] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const defaultAvatar = resolveAvatarUrl(null);

    const { data, error } = await (supabase.from("users") as any)
      .update({ avatar: defaultAvatar, updated_at: new Date().toISOString() })
      .eq("id", student.id)
      .select("id,email,name,avatar,bio,specialization,language,supabase_uid")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await removePreviousAvatar(supabase, student.avatar);

    return NextResponse.json({
      student: {
        ...data,
        avatar: resolveAvatarUrl(data.avatar),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Avatar removal failed.";
    console.error("[Student Avatar] Remove error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function removePreviousAvatar(
  supabase: ReturnType<typeof createAdminClient>,
  avatarUrl?: string | null,
) {
  if (!avatarUrl || avatarUrl === resolveAvatarUrl(null)) return;

  try {
    const marker = "/storage/v1/object/public/avatars/";
    const index = avatarUrl.indexOf(marker);
    if (index === -1) return;

    const path = decodeURIComponent(avatarUrl.slice(index + marker.length));
    if (!path.startsWith("students/")) return;

    await supabase.storage.from("avatars").remove([path]);
  } catch (error) {
    console.warn("[Student Avatar] Previous avatar cleanup skipped:", error);
  }
}
