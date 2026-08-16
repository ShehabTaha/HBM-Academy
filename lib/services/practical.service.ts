import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCourseMastery } from "@/lib/services/mastery.service";
import { sendEmail } from "@/lib/services/email.service";

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function listPracticalSubmissions(studentId: string, lessonId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("practical_submissions") as any)
    .select("*")
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId)
    .order("submitted_at", { ascending: false });

  if (error) return { submissions: [], error: error.message };
  return { submissions: data ?? [] };
}

export async function submitPracticalWork(params: {
  studentId: string;
  lessonId: string;
  file: File;
  notes?: string;
}) {
  const supabase = await createClient();
  const access = await getPracticalAccess(params.studentId, params.lessonId);
  if (access.error) return access;

  if (!allowedTypes.has(params.file.type)) {
    return { error: "Unsupported file type.", status: 400 };
  }

  if (params.file.size > 50 * 1024 * 1024) {
    return { error: "File must be 50MB or smaller.", status: 400 };
  }

  const { count } = await (supabase.from("practical_submissions") as any)
    .select("*", { count: "exact", head: true })
    .eq("student_id", params.studentId)
    .eq("lesson_id", params.lessonId);

  const attemptNumber = (count ?? 0) + 1;
  const safeName = params.file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `${params.studentId}/${params.lessonId}/${Date.now()}_${safeName}`;
  const admin = createAdminClient();

  const upload = await admin.storage
    .from("submissions")
    .upload(path, await params.file.arrayBuffer(), {
      contentType: params.file.type,
      upsert: false,
    });

  if (upload.error) {
    return { error: upload.error.message, status: 500 };
  }

  const { data: signed } = await admin.storage
    .from("submissions")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  const { data: submission, error } = await (supabase.from("practical_submissions") as any)
    .insert({
      student_id: params.studentId,
      lesson_id: params.lessonId,
      file_url: signed?.signedUrl ?? path,
      file_name: params.file.name,
      file_size: params.file.size,
      notes: params.notes ?? null,
      attempt_number: attemptNumber,
      status: "pending",
    })
    .select()
    .single();

  if (error) return { error: error.message, status: 500 };
  const { data: student } = await (supabase.from("users") as any)
    .select("email,name")
    .eq("id", params.studentId)
    .maybeSingle();
  if (student?.email) {
    sendEmail({
      to: student.email,
      subject: "Practical submission received",
      html: `<p>Hi ${student.name ?? "there"},</p><p>Your practical submission has been received and is pending review.</p>`,
      text: "Your practical submission has been received and is pending review.",
      userId: params.studentId,
      templateKey: "practical_submission_received",
    }).catch(() => undefined);
  }

  return { submission };
}

async function getPracticalAccess(studentId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: lesson } = await (supabase.from("lessons") as any)
    .select("id,type,section:sections(course_id)")
    .eq("id", lessonId)
    .maybeSingle();

  if (
    !lesson?.section?.course_id ||
    (lesson.type !== "practical" && lesson.type !== "assignment")
  ) {
    return { error: "Practical lesson not found", status: 404 };
  }

  const mastery = await getCourseMastery(lesson.section.course_id, studentId, lessonId);
  const lessonState = mastery?.lessons.find((item) => item.id === lessonId);

  if (!mastery?.enrollment) return { error: "Enrollment required", status: 403 };
  if (!lessonState) return { error: "Lesson not found", status: 404 };
  if (lessonState.locked) return { error: "Complete the previous lesson first", status: 423 };

  return { mastery, lessonState };
}
