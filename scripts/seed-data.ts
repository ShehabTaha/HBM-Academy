import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User (if not exists)
  // Note: We can't create users directly in auth.users easily without admin API, which we have via service role.
  const adminEmail = "admin@hbm.com";
  const adminPassword = "password123";

  console.log(`Checking/Creating admin user: ${adminEmail}`);
  // Try to sign in or get user by email?
  // Admin listUsers is better.
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
  }

  let adminUser = users?.find((u) => u.email === adminEmail);

  if (!adminUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: "admin", name: "Admin User" },
    });
    if (error) {
      console.error("Error creating admin user:", error);
    } else {
      adminUser = data.user;
      console.log("Admin user created.");
    }
  } else {
    console.log("Admin user already exists.");
  }

  if (adminUser) {
    // Ensure user entry in 'users' table if you have a trigger or manual sync
    // If your app relies on 'public.users', verify it.
    const { error: upsertError } = await supabase.from("users").upsert({
      id: adminUser.id,
      email: adminEmail,
      name: "Admin User",
      role: "admin",
      is_email_verified: true,
      updated_at: new Date().toISOString(),
    });
    if (upsertError)
      console.error("Error upserting admin to public.users:", upsertError);
  }

  // 2. Create Students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const email = `student${i}@test.com`;
    const password = "password123";

    let studentUser = users?.find((u) => u.email === email);
    if (!studentUser) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "student", name: `Student ${i}` },
      });
      if (!error && data.user) {
        students.push(data.user);
        await supabase.from("users").upsert({
          id: data.user.id,
          email: email,
          name: `Student ${i}`,
          role: "student",
          is_email_verified: true,
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      students.push(studentUser);
    }
  }
  console.log(`Ensured ${students.length} students.`);

  // 3. Create Courses
  // We need an instructor ID. Let's use the admin.
  if (!adminUser) return;
  const instructorId = adminUser.id;

  const coursesData = [
    { title: "Intro to React", slug: "intro-react", price: 0, published: true },
    {
      title: "Advanced Next.js",
      slug: "advanced-nextjs",
      price: 99,
      published: true,
    },
    {
      title: "Supabase Mastery",
      slug: "supabase-mastery",
      price: 199,
      published: true,
    },
  ];

  for (const c of coursesData) {
    const { data: course, error } = await supabase
      .from("courses")
      .upsert(
        {
          title: c.title,
          slug: c.slug,
          description: `Description for ${c.title}`,
          instructor_id: instructorId,
          price: c.price,
          is_published: c.published,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select()
      .single();

    if (error) {
      console.error("Error creating course:", c.title, error);
      continue;
    }

    if (course) {
      // Create Sections and Lessons
      const { data: section } = await supabase
        .from("sections")
        .insert({
          course_id: course.id,
          title: "Getting Started",
          order: 1,
        })
        .select()
        .single();

      if (section) {
        await supabase.from("lessons").insert({
          section_id: section.id, // Fixed: was using course.id which is wrong
          title: "Welcome",
          content: { type: "text", text: "Welcome to the course" },
          type: "text",
          order: 1,
          duration: 10,
          is_free_preview: true,
          enable_discussions: true,
          is_downloadable: false,
        });
      }

      // Enroll random students
      for (const s of students) {
        if (Math.random() > 0.5) {
          await supabase.from("enrollments").upsert({
            student_id: s.id,
            course_id: course.id,
            enrolled_at: new Date().toISOString(),
            progress_percentage: Math.floor(Math.random() * 100),
          });
        }
      }
    }
  }

  console.log("Seeding complete.");
}

main().catch(console.error);
