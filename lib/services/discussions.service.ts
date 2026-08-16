import { createClient } from "@/lib/supabase/server";
import { getCourseMastery } from "@/lib/services/mastery.service";

export async function listDiscussionPosts(studentId: string, lessonId: string) {
  const access = await getLessonDiscussionAccess(studentId, lessonId);
  if (access.error) return access;

  const supabase = await createClient();
  const { data, error } = await (supabase.from("discussion_posts") as any)
    .select("*, student:users(id,name,avatar,role)")
    .eq("lesson_id", lessonId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, status: 500 };
  return { posts: data ?? [] };
}

export async function createDiscussionPost(params: {
  studentId: string;
  lessonId: string;
  body: string;
  parentId?: string | null;
}) {
  const access = await getLessonDiscussionAccess(params.studentId, params.lessonId);
  if (access.error) return access;

  const supabase = await createClient();
  const { data, error } = await (supabase.from("discussion_posts") as any)
    .insert({
      lesson_id: params.lessonId,
      student_id: params.studentId,
      parent_id: params.parentId ?? null,
      body: stripHtml(params.body),
    })
    .select("*, student:users(id,name,avatar,role)")
    .single();

  if (error) return { error: error.message, status: 500 };
  return { post: data };
}

export async function updateDiscussionPost(params: {
  studentId: string;
  postId: string;
  body: string;
}) {
  const supabase = await createClient();
  const { data: post } = await (supabase.from("discussion_posts") as any)
    .select("student_id,created_at")
    .eq("id", params.postId)
    .maybeSingle();

  if (!post || post.student_id !== params.studentId) {
    return { error: "Post not found", status: 404 };
  }

  const createdAt = new Date(post.created_at).getTime();
  if (Date.now() - createdAt > 15 * 60 * 1000) {
    return { error: "Posts can only be edited within 15 minutes.", status: 403 };
  }

  const { data, error } = await (supabase.from("discussion_posts") as any)
    .update({ body: stripHtml(params.body), updated_at: new Date().toISOString() })
    .eq("id", params.postId)
    .select("*, student:users(id,name,avatar,role)")
    .single();

  if (error) return { error: error.message, status: 500 };
  return { post: data };
}

export async function deleteDiscussionPost(studentId: string, postId: string) {
  const supabase = await createClient();
  const { data: post } = await (supabase.from("discussion_posts") as any)
    .select("student_id")
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.student_id !== studentId) {
    return { error: "Post not found", status: 404 };
  }

  const { error } = await (supabase.from("discussion_posts") as any)
    .update({
      is_deleted: true,
      body: "This comment was deleted.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) return { error: error.message, status: 500 };
  return { success: true };
}

async function getLessonDiscussionAccess(studentId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: lesson } = await (supabase.from("lessons") as any)
    .select("id,enable_discussions,section:sections(course_id)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson?.section?.course_id) return { error: "Lesson not found", status: 404 };
  if (lesson.enable_discussions === false) {
    return { error: "Discussions are disabled for this lesson.", status: 403 };
  }

  const mastery = await getCourseMastery(lesson.section.course_id, studentId, lessonId);
  const lessonState = mastery?.lessons.find((item) => item.id === lessonId);
  if (!mastery?.enrollment) return { error: "Enrollment required", status: 403 };
  if (!lessonState || lessonState.locked) {
    return { error: "Complete the previous lesson first", status: 423 };
  }

  return { mastery };
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").trim();
}
