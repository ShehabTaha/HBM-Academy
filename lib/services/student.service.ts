import { createClient } from "@/lib/supabase/server";
import { normalizeLanguage, type Language } from "@/lib/i18n";
import { resolveAvatarUrl } from "@/lib/avatar";

export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  specialization: string | null;
  language: Language;
  supabase_uid: string | null;
}

export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  category: string | null;
  level: string | null;
  price: number;
  duration: number;
  instructor?: { id: string; name: string; avatar: string | null } | null;
  sections?: CourseSection[];
}

export interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  section_id: string;
  title: string;
  type: string;
  content: any;
  description: string | null;
  downloadable_file: string | null;
  order: number;
  duration: number;
  is_free_preview: boolean;
  enable_discussions: boolean;
}

export async function getCurrentStudent(): Promise<StudentProfile | null> {
  const supabase = await createClient();

  // Give Supabase up to 5s on cold starts before falling back
  const authResult = await withTimeout(supabase.auth.getUser(), null, 5000);
  const user = authResult?.data?.user;

  if (!user) return null;

  const select =
    "id,email,name,avatar,bio,specialization,language,supabase_uid";

  // Primary lookup: by supabase_uid (fastest, most reliable)
  const byUidResult = await withTimeout(
    (supabase.from("users") as any)
      .select(select)
      .eq("supabase_uid", user.id)
      .maybeSingle(),
    { data: null },
    5000,
  );

  // Fallback: match by email + student role (for accounts created before supabase_uid was added)
  const byEmailResult = byUidResult.data
    ? { data: null }
    : await withTimeout(
        (supabase.from("users") as any)
          .select(select)
          .eq("email", user.email)
          .eq("role", "student")
          .maybeSingle(),
        { data: null },
        5000,
      );

  const student = (byUidResult.data ?? byEmailResult.data) as any;

  // If student found by email but supabase_uid not yet set, backfill it
  if (student && !student.supabase_uid && byEmailResult.data) {
    // Fire-and-forget backfill — don't await
    (supabase.from("users") as any)
      .update({ supabase_uid: user.id })
      .eq("id", student.id)
      .then(() => {})
      .catch(() => {});
  }

  if (!student) return null;

  return {
    ...student,
    avatar: resolveAvatarUrl(student.avatar),
    language: normalizeLanguage(student.language),
  };
}

export async function listPublishedCourses(options?: {
  search?: string;
  category?: string;
}): Promise<PublicCourse[]> {
  const supabase = await createClient();
  let query = (supabase.from("courses") as any)
    .select("*, instructor:users(id,name,avatar)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,description.ilike.%${options.search}%`,
    );
  }

  if (options?.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  const { data } = await withTimeout(query, { data: [] }, 5000);
  return ((data ?? []) as PublicCourse[]).map(normalizeCourseAvatars);
}

export async function getPublicCourse(
  courseIdOrSlug: string,
): Promise<PublicCourse | null> {
  const supabase = await createClient();
  const column = isUuid(courseIdOrSlug) ? "id" : "slug";

  const { data } = await withTimeout(
    (supabase.from("courses") as any)
      .select(
        `
      *,
      instructor:users(id,name,avatar),
      sections(
        id,
        title,
        order,
        lessons(
          id,
          section_id,
          title,
          type,
          content,
          description,
          downloadable_file,
          order,
          duration,
          is_free_preview,
          enable_discussions
        )
      )
    `,
      )
      .eq(column, courseIdOrSlug)
      .eq("is_published", true)
      .maybeSingle(),
    { data: null },
    5000,
  );

  if (!data) return null;
  return sortCourse(normalizeCourseAvatars(data as PublicCourse));
}

export async function getStudentDashboardData(studentId: string) {
  const supabase = await createClient();

  const { data: enrollments } = await withTimeout(
    (supabase.from("enrollments") as any)
      .select("*, course:courses(*)")
      .eq("student_id", studentId)
      .order("enrolled_at", { ascending: false }),
    { data: [] },
    5000,
  );

  const { data: certificates } = await withTimeout(
    (supabase.from("certificates") as any)
      .select("*, enrollment:enrollments(course:courses(title,image))")
      .order("issued_at", { ascending: false })
      .limit(3),
    { data: [] },
    5000,
  );

  return {
    enrollments: enrollments ?? [],
    certificates: certificates ?? [],
  };
}

export function sortCourse(course: PublicCourse): PublicCourse {
  return {
    ...course,
    sections: [...(course.sections ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        ...section,
        lessons: [...(section.lessons ?? [])].sort((a, b) => a.order - b.order),
      })),
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeCourseAvatars(course: PublicCourse): PublicCourse {
  return {
    ...course,
    instructor: course.instructor
      ? {
          ...course.instructor,
          avatar: resolveAvatarUrl(course.instructor.avatar),
        }
      : course.instructor,
  };
}

async function withTimeout<T>(
  promise: PromiseLike<T>,
  fallback: T,
  timeoutMs: number,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => resolve(fallback), timeoutMs);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
