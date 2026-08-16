# HBM Academy — Student Side: Complete Product Plan
> **Version:** 1.0 — Built from full repo audit + all product discovery sessions  
> **Repo:** https://github.com/ShehabTaha/HBM-Academy  
> **Target domain:** hbm.academy  
> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase · NextAuth · Tailwind CSS v4 · Radix UI · Stripe · Framer Motion · jsPDF

---

## Table of Contents

1. [Platform Identity & Core Principles](#1-platform-identity--core-principles)
2. [Existing Infrastructure (Confirmed from Repo)](#2-existing-infrastructure-confirmed-from-repo)
3. [Database Schema — New Tables & Alterations](#3-database-schema--new-tables--alterations)
4. [Updated Middleware](#4-updated-middleware)
5. [Complete Route Map](#5-complete-route-map)
6. [Authentication Flows](#6-authentication-flows)
7. [Page Specifications](#7-page-specifications)
8. [API Route Specifications](#8-api-route-specifications)
9. [Service Layer — New Functions](#9-service-layer--new-functions)
10. [The Mastery Engine](#10-the-mastery-engine)
11. [All 6 Lesson Type Implementations](#11-all-6-lesson-type-implementations)
12. [Payment Flow (Stripe)](#12-payment-flow-stripe)
13. [Certificate Generation](#13-certificate-generation)
14. [Discussion Threads](#14-discussion-threads)
15. [Messaging System](#15-messaging-system)
16. [RTL & Bilingual Support](#16-rtl--bilingual-support)
17. [Component Library](#17-component-library)
18. [Security Model](#18-security-model)
19. [Build Phases & Order](#19-build-phases--order)

---

## 1. Platform Identity & Core Principles

### What HBM Academy is
A **mastery-based** online academy for Hospitality & Business Management. Every certificate issued by HBM carries weight because the system is built so students cannot fake their way through — every lesson must be completed in sequence, every quiz passed at 100%, and every practical assessment approved by an admin before anything unlocks.

### Core Design Principles (non-negotiable in every decision)
1. **Sequential mastery only.** No skipping. No shortcuts. The system enforces this in the server, not just the UI.
2. **Simple, fast, easy.** One thing on screen at a time. No loading spinners on every click. No visual noise.
3. **The locked state guides, it doesn't punish.** Always show what the student needs to do next.
4. **No gamification gimmicks.** No streaks, no badges, no leaderboards. The certificate is the only reward.
5. **Progress is always visible.** The student should never wonder "how far am I?"
6. **Bilingual from day one.** Arabic (RTL) and English (LTR) are equal citizens — never bolted on later.

### Target Audiences
| Audience | Primary Need | UX Implication |
|---|---|---|
| Hospitality professionals (upskilling) | Quick, clear progress — they're busy | Fast navigation, resume exactly where left off |
| Career starters | Direction, credential to show employers | Clear learning paths, prominent certificate |
| Hotel/restaurant companies (B2B, future) | Staff compliance tracking | Data layer ready, portal not built yet |

### Lesson Types (6 total — confirmed from repo)
| Type | Storage Bucket | Completion Gate |
|---|---|---|
| Video | `videos` | Watch ≥ 90% or manual complete |
| Audio | `audio-files` | Listen to end or manual complete |
| PDF / Document | `course-materials` | Manual "Mark as complete" |
| Text / Article | DB field (rich text) | Scroll-to-bottom + manual complete |
| Quiz | DB (quiz_questions table) | Score = 100% — unlimited retries |
| Practical Assessment | `submissions` bucket (new) | Admin approval — unlimited resubmissions with feedback |

---

## 2. Existing Infrastructure (Confirmed from Repo)

### Confirmed Tech Stack
```
Framework:      Next.js ^16.1.6 (App Router)
Runtime:        React 19.2.0
Language:       TypeScript ^5
Auth (admin):   NextAuth ^4.24.13
Auth (student): Supabase Auth (via @supabase/ssr ^0.8.0)
Database:       Supabase (@supabase/supabase-js ^2.84.0)
Payments:       Stripe ^22.1.0 + @stripe/stripe-js ^9.3.1
Styling:        Tailwind CSS ^4.1.16 + tailwind-merge + tw-animate-css
UI Components:  Radix UI (checkbox, dialog, dropdown, label, nav, radio, select, separator, slider, slot, switch, tabs, toast, tooltip)
Icons:          Lucide React ^0.552.0
Forms:          react-hook-form ^7.71.1 + @hookform/resolvers + zod ^4.1.12
Animations:     Framer Motion ^12.23.24
PDF:            jsPDF ^4.2.1 (already installed — use for certificates)
Charts:         Recharts ^3.7.0
Tables:         @tanstack/react-table ^8.21.3
Email:          Nodemailer ^7.0.13
Image:          react-image-crop ^11.0.10
DnD:            @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
Data Fetch:     SWR ^2.3.8
CSV:            Papaparse ^5.5.3
Date:           date-fns ^4.1.0
Hashing:        bcryptjs ^3.0.3
Testing:        Playwright ^1.58.0
```

### Existing Database Tables (do NOT recreate)
```
users           — id, email, name, password, role (admin|lecturer|student), is_email_verified, created_at, ...
courses         — id, title, description, thumbnail_url, category_id, instructor_id, price, is_published, ...
sections        — id, course_id, title, order_index, ...
lessons         — id, section_id, title, lesson_type, content_url, content_text, duration, order_index, ...
enrollments     — id, student_id, course_id, enrolled_at, status, ...
progress        — id, student_id, lesson_id, completed, completed_at, watch_time_seconds, ...
reviews         — id, student_id, course_id, rating, body, created_at, ...
certificates    — id, student_id, course_id, issued_at, certificate_url, ...
```

### Existing Storage Buckets (do NOT recreate)
```
avatars             — public, 5MB, image/jpeg|png|webp
course-thumbnails   — public, 5MB, image/jpeg|png|webp
videos              — public, 2GB, video/*
course-materials    — public, 100MB, application/pdf, application/*, text/*
audio-files         — public, 100MB, audio/*
certificates        — public, 5MB, application/pdf, image/png
```

### Existing Service Files (extend, do not replace)
```
lib/services/users.service.ts
lib/services/courses.service.ts
lib/services/lessons.service.ts
lib/services/enrollments.service.ts
lib/services/progress.service.ts
lib/services/reviews.service.ts
lib/services/certificates.service.ts
lib/services/storage.service.ts
```

### Existing Supabase Clients
```
lib/supabase/client.ts     — browser client (createBrowserClient)
lib/supabase/server.ts     — server client (createServerClient)
lib/supabase/admin.ts      — service role client (bypass RLS)
```

### Existing Middleware (admin-only, NextAuth)
The current `middleware.ts` uses NextAuth `getToken()` to protect `/dashboard` and `/api/admin` routes only. The student-side routes do not exist yet and are entirely unprotected. We will extend this file.

---

## 3. Database Schema — New Tables & Alterations

### 3.1 ALTER existing tables

```sql
-- Add lesson_type enum values if not already present
-- Confirm existing enum includes all 6 types
ALTER TYPE lesson_type ADD VALUE IF NOT EXISTS 'video';
ALTER TYPE lesson_type ADD VALUE IF NOT EXISTS 'audio';
ALTER TYPE lesson_type ADD VALUE IF NOT EXISTS 'pdf';
ALTER TYPE lesson_type ADD VALUE IF NOT EXISTS 'text';
ALTER TYPE lesson_type ADD VALUE IF NOT EXISTS 'quiz';
ALTER TYPE lesson_type ADD VALUE IF NOT EXISTS 'practical';

-- Add specialization to users table (hospitality role track)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS specialization TEXT
    CHECK (specialization IN ('f_and_b','housekeeping','front_office','management','culinary')),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS supabase_uid UUID UNIQUE; 
  -- supabase_uid links the users table record to Supabase auth.users
  -- Students created via Supabase Auth will have this populated by DB trigger

-- Add stripe fields to enrollments table
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add share_token to certificates (for public shareable URL)
ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS png_url TEXT;

-- Add language preference to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar'));
```

### 3.2 New Storage Bucket

```
submissions     — private, 50MB per file
                  Allowed MIME: application/pdf, image/*, application/zip, application/msword,
                                application/vnd.openxmlformats-officedocument.*
                  Access: authenticated students can upload to own folder only
                  Path pattern: {student_id}/{lesson_id}/{timestamp}_{filename}
```

### 3.3 New Tables

```sql
-- ============================================================
-- quiz_questions: individual questions belonging to a quiz lesson
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  option_a        TEXT NOT NULL,
  option_b        TEXT NOT NULL,
  option_c        TEXT,
  option_d        TEXT,
  correct_option  TEXT NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  explanation     TEXT,           -- shown after correct answer
  order_index     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- quiz_attempts: each time a student submits a quiz
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL,   -- { question_id: 'a' | 'b' | 'c' | 'd' }
  score           INTEGER NOT NULL, -- 0-100
  passed          BOOLEAN NOT NULL GENERATED ALWAYS AS (score = 100) STORED,
  attempt_number  INTEGER NOT NULL DEFAULT 1,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_lesson
  ON quiz_attempts(student_id, lesson_id);

-- ============================================================
-- practical_submissions: student work uploaded for admin review
-- ============================================================
CREATE TABLE IF NOT EXISTS practical_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,    -- Supabase storage URL
  file_name       TEXT NOT NULL,    -- original filename for display
  file_size       INTEGER,          -- bytes
  notes           TEXT,             -- optional note from student
  attempt_number  INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  admin_feedback  TEXT,             -- written feedback when rejected
  reviewed_by     UUID REFERENCES users(id),  -- admin who reviewed
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_practical_submissions_student_lesson
  ON practical_submissions(student_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_practical_submissions_status
  ON practical_submissions(status);

-- ============================================================
-- discussion_posts: per-lesson threaded discussion
-- ============================================================
CREATE TABLE IF NOT EXISTS discussion_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  is_pinned       BOOLEAN DEFAULT FALSE,
  is_deleted      BOOLEAN DEFAULT FALSE, -- soft delete
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussion_posts_lesson
  ON discussion_posts(lesson_id);

-- ============================================================
-- conversations: student ↔ admin inbox thread
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- messages: individual messages within a conversation
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  sender_role     TEXT NOT NULL CHECK (sender_role IN ('student','admin')),
  body            TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(conversation_id);

-- ============================================================
-- student_subscriptions: Stripe subscription for category access
-- ============================================================
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT NOT NULL UNIQUE,
  stripe_customer_id      TEXT NOT NULL,
  category_id             UUID REFERENCES course_categories(id),
                          -- NULL = all-access subscription
  status                  TEXT NOT NULL CHECK (status IN ('active','cancelled','past_due','trialing')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 DB Trigger — Auto-create user record on Supabase Auth signup

```sql
-- When a student signs up via Supabase Auth, automatically insert into our users table
CREATE OR REPLACE FUNCTION public.handle_new_supabase_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    supabase_uid,
    email,
    name,
    role,
    is_email_verified,
    language
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student',
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  )
  ON CONFLICT (supabase_uid) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_supabase_user();
```

### 3.5 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all new tables
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;

-- quiz_questions: anyone enrolled can read, only admins can write
CREATE POLICY "Enrolled students can read quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN lessons l ON l.id = quiz_questions.lesson_id
      JOIN sections s ON s.id = l.section_id
      WHERE e.course_id = s.course_id
        AND e.student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid())
    )
  );

-- quiz_attempts: students see only their own
CREATE POLICY "Students manage their own quiz attempts"
  ON quiz_attempts FOR ALL
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- practical_submissions: students see only their own
CREATE POLICY "Students manage their own submissions"
  ON practical_submissions FOR ALL
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- discussion_posts: enrolled students can read all, write their own
CREATE POLICY "Enrolled students can read discussion posts"
  ON discussion_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN lessons l ON l.id = discussion_posts.lesson_id
      JOIN sections s ON s.id = l.section_id
      WHERE e.course_id = s.course_id
        AND e.student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid())
    )
  );
CREATE POLICY "Students can insert their own posts"
  ON discussion_posts FOR INSERT
  WITH CHECK (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- conversations: students see only their own
CREATE POLICY "Students see their own conversations"
  ON conversations FOR ALL
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- messages: students see messages in their conversations only
CREATE POLICY "Students see messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid())
    )
  );

-- student_subscriptions: students see only their own
CREATE POLICY "Students see their own subscriptions"
  ON student_subscriptions FOR SELECT
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));
```

---

## 4. Updated Middleware

The current `middleware.ts` handles admin auth only via NextAuth. We must extend it to handle student routes via Supabase Auth. The two systems must never interfere.

```typescript
// middleware.ts (full replacement)
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedAdminEmail } from "@/lib/security/admin-allowlist";

// Routes that require Supabase student auth
const STUDENT_PROTECTED = [
  "/learn",           // matches /courses/*/learn/*
  "/dashboard",       // student dashboard (not admin — admin is under /admin/dashboard)
  "/profile",
  "/certificates",
  "/messages",
];

// Routes that are public (no auth required)
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/courses",         // catalog and course landing pages are public
  "/c/",             // public certificate share URLs
  "/",
  "/privacy",
  "/terms",
  "/unauthorized",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  let response = NextResponse.next({ request: req });

  // 1. Skip static assets and NextAuth routes
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".")
  ) {
    return response;
  }

  // 2. Admin routes — NextAuth only
  if (path.startsWith("/admin/dashboard") || path.startsWith("/api/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (!isAllowedAdminEmail(token.email as string)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return response;
  }

  // 3. Student protected routes — Supabase Auth
  const isStudentProtected = STUDENT_PROTECTED.some(
    (route) => path.startsWith(route) || path.includes("/learn/")
  );

  if (isStudentProtected) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    return response;
  }

  // 4. Auth pages — redirect already-logged-in students to dashboard
  if (path.startsWith("/auth/") && !path.startsWith("/auth/reset")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 5. Root redirect — check both admin and student sessions
  if (path === "/") {
    const adminToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (adminToken && isAllowedAdminEmail(adminToken.email as string)) {
      return NextResponse.redirect(new URL("/admin/dashboard/home", req.url));
    }
    // Check student session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Neither logged in — show public home page
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
```

**IMPORTANT — Route naming disambiguation:**  
The existing admin dashboard lives at `/dashboard/home`. To avoid collision, the student dashboard will live at `/dashboard` (the student route group is `(student)` and they get the root `/dashboard`). If admin was previously at `/dashboard`, it must be moved to `/admin/dashboard`. Confirm this with the admin code before proceeding.

---

## 5. Complete Route Map

### 5.1 App Router Page Routes

```
app/
│
├── (public)/                           ← No auth required
│   ├── layout.tsx                      ← Public layout (nav with login/signup CTA)
│   ├── page.tsx                        ← Home/landing page
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── unauthorized/page.tsx
│   ├── courses/
│   │   ├── page.tsx                    ← Course catalog (browse & search)
│   │   └── [courseId]/
│   │       └── page.tsx               ← Course landing page (public — shows info + enroll CTA)
│   └── c/
│       └── [shareToken]/page.tsx       ← Public shareable certificate view
│
├── (auth)/                             ← Auth pages (redirect if already logged in)
│   ├── layout.tsx                      ← Minimal layout (logo only)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx    ← Linked from email, has token in URL
│
├── (student)/                          ← Supabase Auth protected
│   ├── layout.tsx                      ← Student shell (top nav + optional sidebar)
│   ├── dashboard/
│   │   └── page.tsx                   ← Student dashboard
│   ├── courses/
│   │   └── [courseId]/
│   │       └── learn/
│   │           ├── layout.tsx         ← Course player layout (sidebar + lesson area)
│   │           └── [lessonId]/
│   │               └── page.tsx       ← Lesson player (all 6 types)
│   ├── profile/
│   │   └── page.tsx                   ← Profile & account settings
│   ├── certificates/
│   │   └── page.tsx                   ← All earned certificates
│   └── messages/
│       ├── page.tsx                   ← Inbox / conversation list
│       └── [conversationId]/
│           └── page.tsx               ← Individual conversation thread
│
└── (admin)/                            ← Existing admin (NextAuth protected — unchanged)
    └── dashboard/
        └── ...
```

### 5.2 API Routes

```
api/
│
├── auth/                               ← NextAuth (existing, do not touch)
│   └── [...nextauth]/route.ts
│
├── student/
│   ├── auth/
│   │   ├── register/route.ts           POST — create Supabase auth user + users table row
│   │   └── profile/route.ts            GET/PATCH — get or update student profile
│   │
│   ├── enroll/route.ts                 POST — create enrollment (free course or post-payment)
│   │
│   ├── progress/
│   │   └── [lessonId]/route.ts         POST — mark lesson complete / update watch time
│   │
│   ├── quiz/
│   │   └── [lessonId]/
│   │       ├── route.ts                GET — fetch questions (without correct answers)
│   │       └── attempt/route.ts        POST — submit answers, get score back
│   │
│   ├── practical/
│   │   └── [lessonId]/
│   │       ├── submit/route.ts         POST — upload file, create submission row
│   │       └── submissions/route.ts    GET — get all submissions for this lesson
│   │
│   ├── certificates/
│   │   ├── route.ts                    GET — list all student certificates
│   │   └── [courseId]/
│   │       └── generate/route.ts       POST — generate + store certificate PDF/PNG
│   │
│   ├── reviews/
│   │   └── [courseId]/route.ts         GET/POST/PATCH — read and submit course review
│   │
│   ├── discussions/
│   │   └── [lessonId]/
│   │       ├── route.ts                GET — list posts, POST — create post
│   │       └── [postId]/route.ts       PATCH/DELETE — edit or soft-delete own post
│   │
│   └── messages/
│       ├── route.ts                    GET — list conversations, POST — start new conversation
│       └── [conversationId]/
│           └── route.ts                GET — get messages, POST — send message
│
├── webhooks/
│   └── stripe/route.ts                 POST — Stripe webhook handler (confirm payment, create enrollment/subscription)
│
└── admin/                              ← Existing (unchanged)
    └── ...
```

---

## 6. Authentication Flows

### 6.1 Student Registration Flow

**Page:** `/auth/register`  
**Component:** Client component  
**Form fields:**
- First Name (required)
- Last Name (required)
- Email (required, validated)
- Password (required, min 8 chars, must include number + uppercase)
- Confirm Password (required, must match)
- "I agree to the Terms of Service and Privacy Policy" checkbox (required)
- Language preference toggle: English / العربية (sets `language` in meta)

**On submit:**
1. Validate all fields with zod schema client-side
2. Show loading state on button
3. Call `supabase.auth.signUp({ email, password, options: { data: { full_name, language } } })`
4. DB trigger fires automatically → creates row in `users` table with role `student`
5. On success → show "Check your email to confirm your account" message
6. After email confirmation → Supabase redirects to `/auth/login?confirmed=true`
7. On login page, show "Email confirmed! Please log in." banner

**Error handling:**
- "Email already in use" → show inline error under email field
- "Password too weak" → show inline error
- Network error → show toast notification

---

### 6.2 Student Login Flow

**Page:** `/auth/login`  
**Component:** Client component  
**Form fields:**
- Email
- Password
- "Remember me" checkbox (extends session expiry)

**On submit:**
1. `supabase.auth.signInWithPassword({ email, password })`
2. On success → check `?redirect` param — if present, go there; else go to `/dashboard`
3. On error → show "Invalid email or password" inline (do not specify which is wrong)

**Additional UX:**
- "Forgot password?" link → `/auth/forgot-password`
- "Don't have an account? Sign up" → `/auth/register`
- If visiting `/auth/login` while already authenticated → redirect to `/dashboard`

---

### 6.3 Forgot Password Flow

**Page:** `/auth/forgot-password`  
**Field:** Email only  
**On submit:**
1. `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://hbm.academy/auth/reset-password' })`
2. Always show success message regardless of whether email exists (security — no enumeration)
3. Student receives email with reset link

**Reset Password Page:** `/auth/reset-password`  
- Supabase automatically sets session from the link token
- Fields: New Password + Confirm Password
- On submit: `supabase.auth.updateUser({ password: newPassword })`
- On success: redirect to `/auth/login?reset=true`

---

### 6.4 Session Management

- Supabase session is stored in cookies via `@supabase/ssr`
- Server Components read session via `createServerClient()` from `lib/supabase/server.ts`
- Client Components read session via `supabase.auth.getUser()` or a `useStudent()` context hook
- Session refresh is handled automatically by the Supabase SSR client
- Logout: `supabase.auth.signOut()` → clears cookies → redirect to `/auth/login`

**`useStudent()` context hook (new file: `contexts/StudentContext.tsx`):**
```typescript
// Provides: { student, isLoading, isAuthenticated, signOut }
// student = combined Supabase auth user + users table profile
// Wrap the (student) layout with this provider
```

---

## 7. Page Specifications

### 7.1 Student Dashboard — `/dashboard`

**Component type:** Server Component (data fetched server-side)  
**Auth:** Supabase session required — redirect to `/auth/login` if none

**Layout:**
- Top navigation bar (logo, search, notifications bell, avatar dropdown)
- Main content area (no persistent sidebar — this is the overview page)

**Sections on page:**

#### Section A — Welcome header
- "Welcome back, [First Name]" greeting
- Current date/time
- Quick stats row:
  - Total enrolled courses
  - Completed courses  
  - Average progress across all active courses (%)
  - Certificates earned

#### Section B — Continue Learning
- Shows the **1-2 courses** the student most recently accessed
- Each card contains:
  - Course thumbnail
  - Course title
  - Section name + lesson name they're currently on
  - Progress bar (e.g. "7 of 24 lessons complete")
  - "Resume" button → `/courses/[courseId]/learn/[lastLessonId]`
- "Resume" targets the exact last lesson the student was on (stored in `progress` table — most recent `updated_at`)

#### Section C — My Courses
- Grid of ALL enrolled courses (2 columns desktop, 1 column mobile)
- Each CourseCard shows:
  - Thumbnail
  - Title
  - Short description (max 2 lines, truncated)
  - Progress bar with percentage label
  - Status badge: "In Progress" | "Completed" | "Not Started"
  - "Resume Course" or "Start Course" or "View Certificate" button
- If 0 courses enrolled:
  - Empty state illustration
  - "You haven't enrolled in any courses yet. Explore our courses to get started."
  - "Browse Courses" button → `/courses`

#### Section D — Progress Overview (sidebar panel or bottom section)
- Horizontal bar chart per course showing section-by-section completion
- Built with Recharts (already installed)

#### Section E — Recent Certificates (if any)
- Horizontal scroll row of certificate cards
- Each card: course name, date issued, "View" and "Download" buttons

**Data fetched (server-side):**
```typescript
// In server component, using createServerClient()
const student = await getStudentBySupabaseUid(supabase_uid)
const enrollments = await getStudentEnrollments(student.id) // includes course data + progress summary
const recentProgress = await getLastAccessedLesson(student.id)
const certificates = await getStudentCertificates(student.id)
```

---

### 7.2 Course Catalog — `/courses`

**Component type:** Server Component with client-side filter interactions  
**Auth:** Public — no auth required

**Layout:**
- Full-width page
- Filter sidebar (desktop: left rail; mobile: drawer)
- Course grid (right/main area)

**Filter options:**
- Category / Track (F&B, Housekeeping, Front Office, Management, Culinary)
- Language (Arabic, English)
- Price (Free, Paid, Subscription)
- Level (if implemented in courses table)
- Search bar at top (searches title + description)

**Course Grid:**
- 3 columns desktop, 2 tablet, 1 mobile
- Each CourseCard:
  - Thumbnail image (from `course-thumbnails` bucket)
  - Category badge (colored by track)
  - Title (max 2 lines)
  - Short description (max 3 lines)
  - Instructor name + avatar
  - Rating stars + review count (from `reviews` table)
  - Total lessons count + estimated duration
  - Price display:
    - If free → "Free" green badge
    - If paid → "$XX.XX" 
    - If covered by subscription → "Included in [Track] subscription"
  - "View Course" button → `/courses/[courseId]`
- If student is already enrolled → "Continue" button instead of "View Course"
- If 0 results → "No courses found. Try adjusting your filters."

**Pagination / Infinite scroll:**
- Load 12 courses initially
- "Load More" button (not infinite scroll — better for accessibility)

---

### 7.3 Course Landing Page — `/courses/[courseId]`

**Component type:** Server Component (SEO critical — public page)  
**Auth:** Public (visible to anyone, buy/enroll requires auth)

**Layout:**
- Hero section (full-width banner with course thumbnail as background, overlaid with course info)
- Two-column: main content left, purchase card right (sticky on desktop)

**Hero section:**
- Course title (H1)
- Short description
- Category badge
- Instructor name + avatar + "N courses"
- Rating + review count
- Last updated date
- Language(s) of course content

**Main content (left column):**

*What you'll learn (bullet list):*
- Learning objectives stored in course data (up to 8 bullets)

*Course includes:*
- Total video hours
- Total lessons (broken down by type: X videos, X audio, X PDFs, X quizzes, X practicals)
- Certificate upon completion
- Language

*Course curriculum (accordion by section):*
- Each section is an accordion item showing: section title + lesson count + duration
- Expanded: list of lessons with type icon, title, duration
- All lessons show as locked (padlock icon) for non-enrolled students
- First lesson title visible, rest may be blurred (but no free preview — no unlock)

*Instructor section:*
- Avatar, name, bio, stats

*Student reviews section:*
- Average rating (large number + stars)
- Rating distribution bar chart
- Individual review cards (student name, date, star rating, review text)
- "Write a review" for enrolled + completed students only

**Purchase card (right column, sticky):**
- Course thumbnail video/image preview
- Price (or "Included in your [Track] subscription" if subscribed)
- What's included list
- Primary CTA button:
  - Not logged in → "Enroll Now" → redirects to `/auth/login?redirect=/courses/[id]`
  - Logged in, not enrolled → "Enroll Now" (if free) or "Buy Now" (if paid) or "Subscribe to [Track]"
  - Already enrolled → "Go to Course" → `/courses/[courseId]/learn/[firstUnlockedLessonId]`
  - Subscription covers this course → "Start Learning" (free for them)
- Secure payment badge
- "30-day money-back guarantee" (if applicable)

---

### 7.4 Course Player — `/courses/[courseId]/learn/[lessonId]`

**Component type:** Client Component (layout.tsx is client for sidebar interactions)  
**Auth:** Supabase session + enrollment + lesson unlock — all checked server-side in layout

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  [← Back to Dashboard]    Course Title         [Avatar]  │  ← Top bar
│─────────────────────────────────────────────────────────│
│  [Progress bar ████████░░░░░░░ 45%]                      │
│─────────────────────────────────────────────────────────│
│                        │                                 │
│  SIDEBAR               │  LESSON CONTENT AREA            │
│  ─────────             │  ──────────────────             │
│  Section 1 ▾           │                                 │
│   ✓ Lesson 1           │  [Lesson title]                 │
│   ✓ Lesson 2           │                                 │
│   ▶ Lesson 3 (active) │  [Video / Audio / PDF /          │
│   🔒 Lesson 4          │   Text / Quiz / Practical]      │
│   🔒 Lesson 5          │                                 │
│                        │  [Navigation: ← Prev | Next →] │
│  Section 2 ▾           │                                 │
│   🔒 all locked        │  [Discussion thread]            │
│                        │                                 │
└────────────────────────┴─────────────────────────────────┘
```

**Sidebar behavior:**
- Shows all sections and all lessons within each section
- Each lesson has a status icon:
  - ✓ (green checkmark) = completed
  - ▶ (blue play) = current active lesson  
  - 🔒 (gray padlock) = locked (prerequisite not met)
  - ○ (empty circle) = unlocked but not started
- Clicking a locked lesson → shows tooltip: "Complete [previous lesson name] to unlock this lesson"
- Clicking an unlocked/completed lesson → navigates to that lesson (URL change, no page reload)
- Sidebar is collapsible on desktop (toggle button), drawer on mobile
- Section headers show: "Section 2 — 3/8 complete"
- Sidebar scroll position preserved when navigating between lessons

**Top bar:**
- "← Back to Dashboard" link (left)
- Course title (center, truncated if long)
- Student avatar with dropdown: profile, logout (right)

**Progress bar:**
- Shows overall course completion percentage
- Updates instantly when a lesson is marked complete
- e.g. "12 of 24 lessons complete (50%)"

**Navigation buttons (below lesson content):**
- "← Previous Lesson" (disabled if on first lesson)
- "Next Lesson →" (disabled if next lesson is locked)
- "Mark as Complete" button (for video/audio/pdf/text lessons)

**Discussion thread:**
- Shown below the lesson content
- See section 14 for full spec

**Three-layer access control (checked in layout.tsx server component):**
```typescript
// 1. Auth check
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/auth/login?redirect=...')

// 2. Enrollment check
const student = await getStudentBySupabaseUid(user.id)
const enrollment = await checkEnrollment(student.id, courseId)
  // checkEnrollment: checks enrollments table OR active subscription covering this course
if (!enrollment) redirect(`/courses/${courseId}`) // show landing page with upsell

// 3. Lesson unlock check
const isUnlocked = await isLessonUnlocked(student.id, lessonId)
if (!isUnlocked) redirect(`/courses/${courseId}/learn/${firstUnlockedLessonId}`)
  // redirect to the last lesson they CAN access, not a 404
```

---

### 7.5 Profile & Settings — `/profile`

**Component type:** Client Component  
**Auth:** Supabase session required

**Tabs on page:**

#### Tab 1 — Personal Info
- Avatar: current avatar displayed, "Change Photo" button → file picker → react-image-crop → upload to `avatars` bucket → update URL in `users` table
- First Name (editable)
- Last Name (editable)
- Email (display only — email changes go through Supabase Auth flow)
- Bio (optional, textarea, max 300 chars)
- Specialization (dropdown: F&B Service, Housekeeping, Front Office, Management, Culinary)
- Language preference: English | العربية (toggle — affects UI language for this user)
- "Save Changes" button → PATCH `/api/student/auth/profile`

#### Tab 2 — Security
- Change Password form:
  - Current password
  - New password
  - Confirm new password
- On submit → `supabase.auth.updateUser({ password: newPassword })` (Supabase handles verification)
- "Change Email" section: sends verification to new email via `supabase.auth.updateUser({ email: newEmail })`

#### Tab 3 — My Certificates
- Same certificate grid as shown on dashboard
- Each certificate card:
  - Course thumbnail + name
  - Date issued
  - "View" button → opens certificate in modal (PDF viewer)
  - "Download PDF" button → triggers browser download of PDF from storage
  - "Download PNG" button → triggers download of PNG version
  - "Share to LinkedIn" button → opens LinkedIn "Add Certification" prefilled URL:
    ```
    https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
      &name=[Course Title]
      &organizationName=HBM Academy
      &issueYear=[year]
      &issueMonth=[month]
      &certUrl=https://hbm.academy/c/[shareToken]
    ```

#### Tab 4 — Billing & Subscriptions
- Active subscriptions: each shows track name, billing period, price, next renewal date, "Cancel" button
- Purchase history: table of all payments (course title, date, amount, status)
- "Manage Billing" → Stripe Customer Portal link (using `stripe.billingPortal.sessions.create()`)

---

### 7.6 Certificates — `/certificates`

**Component type:** Server Component  
**Auth:** Supabase session required

**Layout:**
- Page title: "My Certificates"
- Grid of CertificateCards (3 per row desktop, 1 mobile)
- Each CertificateCard:
  - Certificate design preview (thumbnail)
  - Course name
  - Completion date
  - "View" | "Download PDF" | "Download PNG" | "Share on LinkedIn" actions
- Empty state: "Complete a course to earn your first certificate" with illustration + "Browse Courses" CTA

**Public certificate URL:** `/c/[shareToken]`
- Server component, fully public (no auth)
- Displays certificate in a clean branded page
- Shows: student name, course name, completion date, HBM Academy seal/logo
- "Verify this certificate" text with the share URL
- Meta tags for OG (LinkedIn/social previews)

---

### 7.7 Messages — `/messages`

**Component type:** Client Component (Supabase Realtime)  
**Auth:** Supabase session required

**Layout (two panels on desktop, stack on mobile):**

**Left panel — Conversation list:**
- Each conversation: subject line, last message preview, date, unread badge
- "New Message" button → modal to start new conversation (subject + message body)
- Conversations sorted by latest activity

**Right panel — Message thread:**
- Shows when a conversation is selected
- Thread title (subject)
- Messages displayed as chat bubbles (student = right, admin = left)
- Student messages: right-aligned, brand primary color
- Admin messages: left-aligned, gray
- Timestamp per message
- Message input box at bottom + "Send" button
- Realtime: new messages appear instantly via `supabase.channel('conversation:[id]').on('postgres_changes', ...)`
- "Resolved" badge shown if admin has marked conversation resolved
- If resolved: input is disabled, "This conversation has been resolved" notice + "Reopen" link

---

### 7.8 Home / Landing Page — `/`

**Component type:** Server Component  
**Auth:** None — fully public. If authenticated, redirect to `/dashboard`.

**Sections:**
1. **Hero** — headline, subheadline, CTA ("Start Learning" → `/auth/register`, "Browse Courses" → `/courses`)
2. **Value proposition** — 3 cards: "Mastery-based learning", "Industry-recognized skills", "Bilingual content"
3. **Featured courses** — carousel or grid of 6 published courses
4. **How it works** — 4-step visual flow (Browse → Enroll → Learn → Earn)
5. **Tracks / Categories** — 5 cards with icons for each specialization
6. **Testimonials** — (placeholder for real reviews later)
7. **CTA banner** — "Ready to advance your career?" with register button
8. **Footer** — links, legal, social

---

## 8. API Route Specifications

### `POST /api/student/auth/register`
> Register a new student via Supabase Auth + create profile

**Body:** `{ firstName, lastName, email, password, language }`  
**Logic:**
1. Validate with zod
2. Call `supabase.auth.signUp()` with server-side admin client
3. DB trigger creates `users` row automatically
4. Return `{ success: true, message: "Check your email to confirm your account" }`

**Errors:**
- 400: validation failure
- 409: email already registered

---

### `GET /api/student/auth/profile`
> Get current student's profile

**Auth:** Supabase session cookie  
**Logic:** Get `supabase_uid` from session → query `users` table  
**Returns:** `{ id, email, name, avatar_url, bio, specialization, language, created_at }`

---

### `PATCH /api/student/auth/profile`
> Update student profile fields

**Body:** `{ name?, bio?, specialization?, language?, avatar_url? }`  
**Logic:** Update `users` row where `supabase_uid = auth.uid()`  

---

### `POST /api/student/enroll`
> Enroll student in a free course

**Body:** `{ courseId }`  
**Auth:** Supabase session  
**Logic:**
1. Check course exists and is published
2. Check course is free (price = 0) — paid courses go through Stripe
3. Check not already enrolled
4. Insert into `enrollments` table: `{ student_id, course_id, status: 'active' }`
5. Return `{ success: true, enrollmentId }`

**Errors:**
- 400: already enrolled
- 403: course is paid (must go through checkout)
- 404: course not found

---

### `POST /api/student/progress/[lessonId]`
> Mark a lesson as complete or update watch progress

**Body:** `{ completed: boolean, watchTimeSeconds?: number, watchPercentage?: number }`  
**Auth:** Supabase session  
**Logic:**
1. Verify student is enrolled in the course this lesson belongs to
2. Verify lesson is unlocked (previous lesson complete)
3. Upsert into `progress` table
4. If `completed = true`: check if this was the final lesson in the course → trigger certificate generation check
5. Return `{ success: true, nextLessonId: string | null }`

**Side effects when last lesson completed:**
- Call `checkAndIssueCertificate(studentId, courseId)`:
  - Count total lessons in course
  - Count completed lessons for this student
  - If equal → insert into `certificates` table + generate PDF (background)

---

### `GET /api/student/quiz/[lessonId]`
> Fetch quiz questions for a lesson (without correct answers)

**Auth:** Supabase session + enrollment check  
**Returns:**
```typescript
{
  questions: Array<{
    id: string,
    question_text: string,
    option_a: string,
    option_b: string,
    option_c: string | null,
    option_d: string | null,
    order_index: number
  }>,
  previousAttempts: number
}
```
Note: `correct_option` and `explanation` are NOT returned — server evaluates answers.

---

### `POST /api/student/quiz/[lessonId]/attempt`
> Submit quiz answers and get score

**Body:** `{ answers: Record<questionId, 'a'|'b'|'c'|'d'> }`  
**Auth:** Supabase session + enrollment check  
**Logic:**
1. Fetch correct answers from DB (server-side only — never exposed to client)
2. Calculate score: `(correct / total) * 100`
3. Insert into `quiz_attempts` table with score, passed, attempt_number
4. If `passed = true`: upsert `progress` with `completed = true`
5. Return:
```typescript
{
  score: number,           // 0-100
  passed: boolean,         // true only if score === 100
  correct: number,         // how many correct
  total: number,           // total questions
  wrongQuestionIds: string[], // IDs of questions answered wrong
  explanations: Record<questionId, string>, // explanations for wrong answers only
  nextLessonId: string | null  // populated if passed
}
```

---

### `POST /api/student/practical/[lessonId]/submit`
> Upload practical assessment file

**Body:** `FormData` with fields: `file` (file), `notes` (optional string)  
**Auth:** Supabase session + enrollment + unlock check  
**Logic:**
1. Validate file type and size (max 50MB)
2. Check no pending submission exists (can only have one pending at a time)
3. Upload file to `submissions` bucket at path `{studentId}/{lessonId}/{timestamp}_{filename}`
4. Get signed URL or public URL
5. Get `attempt_number` = previous attempts count + 1
6. Insert into `practical_submissions` table with `status: 'pending'`
7. Return `{ success: true, submissionId }`

---

### `GET /api/student/practical/[lessonId]/submissions`
> Get all submissions history for a practical lesson

**Auth:** Supabase session  
**Returns:** Array of submissions in reverse chronological order (newest first), each with: id, attempt_number, status, admin_feedback, file_name, submitted_at, reviewed_at

---

### `POST /api/student/certificates/[courseId]/generate`
> Generate certificate PDF + PNG and store in Supabase

**Auth:** Supabase session  
**Logic:**
1. Verify all lessons in course are completed by this student
2. Verify no certificate already exists (idempotent)
3. Fetch student name, course name, completion date
4. Generate certificate using jsPDF:
   - A4 landscape
   - HBM Academy logo
   - "Certificate of Completion"
   - Student full name (large, centered)
   - "has successfully completed"
   - Course title
   - Date issued
   - Unique certificate ID (share_token)
   - Signature line (HBM Academy)
5. Upload PDF and PNG versions to `certificates` bucket
6. Generate `share_token` = `nanoid(12)`
7. Upsert into `certificates` table: `{ student_id, course_id, issued_at, certificate_url, share_token, pdf_url, png_url }`
8. Return `{ certificateId, shareUrl: "https://hbm.academy/c/[shareToken]" }`

---

### `GET /api/student/reviews/[courseId]`
> Get reviews for a course

**Returns:** `{ averageRating, totalReviews, distribution: { 1-5 }, reviews: [...] }`

---

### `POST /api/student/reviews/[courseId]`
> Submit a review for a completed course

**Body:** `{ rating: 1-5, body: string }`  
**Auth:** Supabase session + must be enrolled + course must be completed  
**Logic:** Insert or update `reviews` table (one review per student per course)

---

### `GET /api/student/discussions/[lessonId]`
> Get all discussion posts for a lesson

**Auth:** Supabase session + enrollment check  
**Returns:** Threaded posts (parent posts with nested replies), sorted by newest first

---

### `POST /api/student/discussions/[lessonId]`
> Post a new discussion post or reply

**Body:** `{ body: string, parentId?: string }`  
**Auth:** Supabase session + enrollment check  
**Logic:** Insert into `discussion_posts` table

---

### `POST /api/webhooks/stripe`
> Handle Stripe webhook events — CRITICAL, handles all payment outcomes

**Headers:** `stripe-signature` (must be verified with `STRIPE_WEBHOOK_SECRET`)  
**Events handled:**

| Event | Action |
|---|---|
| `checkout.session.completed` (mode: payment) | Create enrollment for per-course purchase |
| `checkout.session.completed` (mode: subscription) | Create `student_subscriptions` row |
| `invoice.payment_succeeded` | Renew subscription — update `current_period_end` |
| `invoice.payment_failed` | Mark subscription `past_due` |
| `customer.subscription.deleted` | Mark subscription `cancelled` |

**Logic for `checkout.session.completed`:**
1. Retrieve full session from Stripe API
2. Read `metadata.studentId` and `metadata.courseId` (or `metadata.categoryId` for subscriptions)
3. For course purchase: insert into `enrollments` with `stripe_session_id`
4. For subscription: insert into `student_subscriptions`
5. Return 200 immediately (Stripe expects fast response)

---

### `POST /api/student/checkout/course`
> Create a Stripe Checkout session for a course purchase

**Body:** `{ courseId }`  
**Auth:** Supabase session  
**Logic:**
1. Fetch course price from DB
2. Ensure not already enrolled
3. Create Stripe Checkout session (mode: `payment`):
   - `line_items`: course title + price
   - `metadata`: `{ studentId, courseId }`
   - `success_url`: `https://hbm.academy/courses/[courseId]/learn/[firstLessonId]?payment=success`
   - `cancel_url`: `https://hbm.academy/courses/[courseId]`
4. Return `{ checkoutUrl }` → client redirects to Stripe Checkout

---

### `POST /api/student/checkout/subscription`
> Create a Stripe Checkout session for a category subscription

**Body:** `{ categoryId, priceId }` (priceId is the Stripe Price ID configured in admin)  
**Auth:** Supabase session  
**Logic:**
1. Check not already subscribed to this category
2. Create or retrieve Stripe Customer for this student
3. Create Stripe Checkout session (mode: `subscription`):
   - `line_items`: subscription price
   - `metadata`: `{ studentId, categoryId }`
   - `success_url`: `https://hbm.academy/dashboard?subscribed=true`
   - `cancel_url`: `https://hbm.academy/courses`
4. Return `{ checkoutUrl }`

---

## 9. Service Layer — New Functions

Add these to the appropriate existing service files or create new ones:

### `lib/services/student.service.ts` (new file)
```typescript
getStudentBySupabaseUid(supabaseUid: string): Promise<User>
updateStudentProfile(studentId: string, data: Partial<User>): Promise<User>
getStudentEnrollments(studentId: string): Promise<EnrollmentWithCourse[]>
getStudentDashboardStats(studentId: string): Promise<DashboardStats>
getLastAccessedLesson(studentId: string): Promise<LessonWithCourse | null>
```

### `lib/services/progress.service.ts` (extend existing)
```typescript
markLessonComplete(studentId: string, lessonId: string): Promise<void>
updateWatchProgress(studentId: string, lessonId: string, seconds: number, percentage: number): Promise<void>
getLessonProgress(studentId: string, lessonId: string): Promise<Progress | null>
getCourseProgress(studentId: string, courseId: string): Promise<CourseProgressSummary>
isLessonUnlocked(studentId: string, lessonId: string): Promise<boolean>
getFirstUnlockedLesson(studentId: string, courseId: string): Promise<string> // returns lessonId
```

### `lib/services/mastery.service.ts` (new file)
```typescript
// The core engine that enforces sequential unlock
getLessonUnlockStatus(studentId: string, courseId: string): Promise<Map<string, 'locked'|'unlocked'|'completed'>>
// Returns map of all lessonIds to their unlock state
// Used to render the sidebar efficiently in one query

isPracticalApproved(studentId: string, lessonId: string): Promise<boolean>
isQuizPassed(studentId: string, lessonId: string): Promise<boolean>
```

### `lib/services/quiz.service.ts` (new file)
```typescript
getQuizQuestions(lessonId: string): Promise<QuizQuestion[]>  // without correct_option
evaluateQuizAttempt(lessonId: string, answers: Record<string, string>): Promise<QuizResult>
getQuizAttempts(studentId: string, lessonId: string): Promise<QuizAttempt[]>
```

### `lib/services/practical.service.ts` (new file)
```typescript
createSubmission(studentId: string, lessonId: string, fileUrl: string, fileName: string, notes?: string): Promise<PracticalSubmission>
getSubmissions(studentId: string, lessonId: string): Promise<PracticalSubmission[]>
getCurrentSubmissionStatus(studentId: string, lessonId: string): Promise<'not_submitted'|'pending'|'approved'|'rejected'>
```

### `lib/services/certificates.service.ts` (extend existing)
```typescript
checkAndIssueCertificate(studentId: string, courseId: string): Promise<Certificate | null>
generateCertificatePDF(student: User, course: Course, issuedAt: Date): Promise<{ pdfBuffer: Buffer, pngBuffer: Buffer }>
getCertificateByShareToken(shareToken: string): Promise<CertificateWithDetails | null>
getStudentCertificates(studentId: string): Promise<Certificate[]>
```

### `lib/services/discussions.service.ts` (new file)
```typescript
getDiscussionPosts(lessonId: string): Promise<ThreadedPost[]>
createPost(studentId: string, lessonId: string, body: string, parentId?: string): Promise<DiscussionPost>
softDeletePost(postId: string, studentId: string): Promise<void>
```

### `lib/services/messages.service.ts` (new file)
```typescript
getConversations(studentId: string): Promise<ConversationWithLastMessage[]>
getMessages(conversationId: string): Promise<Message[]>
sendMessage(conversationId: string, senderId: string, senderRole: 'student'|'admin', body: string): Promise<Message>
startConversation(studentId: string, subject: string, firstMessage: string): Promise<Conversation>
```

### `lib/services/access.service.ts` (new file)
```typescript
// Single source of truth for access control
hasAccessToCourse(studentId: string, courseId: string): Promise<boolean>
// Checks: active enrollment OR active subscription covering course's category

getAccessSource(studentId: string, courseId: string): Promise<'enrollment'|'subscription'|null>
```

---

## 10. The Mastery Engine

### Core Principle
Every lesson in a course is either `locked`, `unlocked`, or `completed`. The engine determines this state for every lesson in a course in a single efficient DB query, then the UI renders accordingly.

### How unlock is calculated

```typescript
// lib/services/mastery.service.ts
async function getLessonUnlockStatus(
  studentId: string,
  courseId: string
): Promise<Map<string, 'locked' | 'unlocked' | 'completed'>> {

  // 1. Fetch all lessons in course, ordered by section.order_index, lesson.order_index
  const lessons = await getAllLessonsInCourse(courseId) // ordered

  // 2. Fetch all completed lesson IDs for this student in this course
  const completedIds = await getCompletedLessonIds(studentId, courseId)

  // 3. Walk the ordered list and compute state
  const result = new Map()
  let previousCompleted = true // Lesson 1 of Section 1 is always unlocked

  for (const lesson of lessons) {
    if (completedIds.has(lesson.id)) {
      result.set(lesson.id, 'completed')
      previousCompleted = true
    } else if (previousCompleted) {
      result.set(lesson.id, 'unlocked')
      previousCompleted = false // Only ONE unlocked lesson at a time (strictly sequential)
    } else {
      result.set(lesson.id, 'locked')
    }
  }

  return result
}
```

### What "completed" means per lesson type

| Type | Completion mechanism | Server validation |
|---|---|---|
| Video | Student clicks "Mark Complete" (after ≥ 90% watch) | API checks `watchPercentage >= 90` in request body |
| Audio | Student clicks "Mark Complete" (after reaching end) | API checks `completed: true` from client |
| PDF | Student clicks "Mark Complete" | No threshold — trust the client button press |
| Text | Student clicks "Mark Complete" (button enabled after scroll) | No threshold — trust the client |
| Quiz | Score = 100% on a quiz attempt | Server calculates score independently — never trust client score |
| Practical | Admin sets submission status to 'approved' | DB trigger or webhook updates `progress` table automatically |

### DB Trigger for Practical Approval

```sql
-- When a practical_submission is approved, auto-mark lesson as complete in progress table
CREATE OR REPLACE FUNCTION handle_practical_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO progress (student_id, lesson_id, completed, completed_at)
    VALUES (NEW.student_id, NEW.lesson_id, true, NOW())
    ON CONFLICT (student_id, lesson_id)
    DO UPDATE SET completed = true, completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_practical_approved
  AFTER UPDATE ON practical_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION handle_practical_approval();
```

---

## 11. All 6 Lesson Type Implementations

The lesson player page (`/courses/[courseId]/learn/[lessonId]/page.tsx`) is a client component that switches rendering based on `lesson.lesson_type`.

```typescript
// Lesson player router
switch (lesson.lesson_type) {
  case 'video':    return <VideoLesson lesson={lesson} onComplete={handleComplete} />
  case 'audio':    return <AudioLesson lesson={lesson} onComplete={handleComplete} />
  case 'pdf':      return <PdfLesson lesson={lesson} onComplete={handleComplete} />
  case 'text':     return <TextLesson lesson={lesson} onComplete={handleComplete} />
  case 'quiz':     return <QuizLesson lesson={lesson} studentId={studentId} onComplete={handleComplete} />
  case 'practical': return <PracticalLesson lesson={lesson} studentId={studentId} />
}
```

### 11.1 VideoLesson Component

**Libraries:** Native HTML5 `<video>` element (no third-party player — avoids download ability)  
**Implementation:**
```
- Render <video> with controlsList="nodownload" + oncontextmenu="return false"
- Track currentTime and duration via onTimeUpdate event
- Calculate watchPercentage = (currentTime / duration) * 100
- When watchPercentage >= 90: enable "Mark as Complete" button
- Save watch progress every 30 seconds to /api/student/progress/[lessonId] (debounced)
  — This enables "resume from where you left off"
- On mount: if progress.watch_time_seconds exists, set video.currentTime = watch_time_seconds
- "Mark as Complete" button: POST to /api/student/progress/[lessonId] with { completed: true }
  → On success: update sidebar state, show success animation, enable "Next →" button
```

**Security note:** Video URL is a Supabase signed URL (time-limited) or serves via Next.js route that adds auth header. Direct bucket URL should NOT be accessible without auth if videos are private. If keeping `videos` bucket public, rely on obscurity of URLs (acceptable for phase 1, revisit for production).

### 11.2 AudioLesson Component

**Implementation:**
```
- Render <audio> with controlsList="nodownload"
- Same watch-time tracking as video but for audio
- Auto-enable "Mark as Complete" when audio reaches onEnded event OR at >= 95%
- Show waveform visualizer (optional enhancement — use a simple progress bar instead for MVP)
- If lesson has associated transcript (content_text field): show below player in expandable panel
- If lesson has associated PDF materials: show "Lesson Materials" link
```

### 11.3 PdfLesson Component

**Implementation:**
```
- Use <iframe src={pdfUrl}#toolbar=0> to embed PDF in browser (disables browser PDF toolbar download)
  OR use react-pdf library for more controlled rendering
- Set height to fill available screen space
- "Mark as Complete" button always visible (not gated by scroll — PDF reading can't be detected)
- Optionally: show "Please read the document above before marking complete" text
- If lesson has content_text as well: show in a tab below ("Notes" tab)
```

### 11.4 TextLesson Component

**Implementation:**
```
- Render lesson.content_text as sanitized HTML (use DOMPurify or next-mdx-remote for markdown)
- Full-width readable typography (max-width: 680px, centered, line-height: 1.8)
- RTL-aware: if lesson language is Arabic, set dir="rtl" on the content container
- Track scroll position: 
  - Add scroll listener on mount
  - When user scrolls to within 100px of bottom: enable "Mark as Complete" button
  - Show "Please read to the end to continue" hint if button not yet enabled
- "Mark as Complete" → POST progress API → unlock next lesson
```

### 11.5 QuizLesson Component

**States the component must handle:**
1. **Start state** — "Ready to take the quiz? This quiz requires a 100% score to proceed." + "Start Quiz" button + previous attempt count if any
2. **In progress state** — Questions rendered one at a time or all at once (configurable)
3. **Submitted state** — Score shown, pass/fail result
4. **Passed state** — Celebration UI, "Next Lesson →" button enabled
5. **Failed state** — "X/Y correct. You need 100% to proceed. Try again." + "Retry Quiz" button + show which questions were wrong + explanations

**Question rendering:**
```
- Show all questions in a scrollable form (not one-by-one — student can review before submitting)
- Each question: question_text, then radio buttons for option_a, option_b, option_c (if exists), option_d (if exists)
- "Submit Quiz" button disabled until all questions answered
- Confirm before submit: "Are you sure you want to submit? You cannot change answers after submitting."
- After submit: highlight correct (green) and wrong (red) options
- Show explanation below each wrong answer
- Score prominently displayed: "8/10 — 80%"
- If 100%: "🎉 Perfect score! Next lesson is now unlocked."
- Retry: resets all answers, fetches same questions (shuffled? — configurable)
- Attempt counter: "Attempt 3 of unlimited"
```

### 11.6 PracticalLesson Component

**States (4 distinct UI states):**

**State 1 — Not yet submitted:**
```
- Task title and description (from lesson.content_text — can be rich text with instructions)
- "What to submit" section (format, requirements)
- File upload dropzone:
  - Drag and drop area with dashed border
  - "or click to browse files"
  - Accepted formats listed: PDF, Word, ZIP, Images
  - Max file size: 50MB
- Optional "Notes to reviewer" textarea
- "Submit for Review" button (disabled until file selected)
- Loading state during upload
```

**State 2 — Pending review:**
```
- Submitted file shown: filename, size, upload date
- Status badge: "Under Review" (amber/orange)
- "Your submission is being reviewed by our team. We'll notify you once it's evaluated."
- Previous submissions list (accordion below showing older attempts if any)
- "Resubmit" button HIDDEN (cannot resubmit while pending)
- Next lesson in sidebar remains locked
```

**State 3 — Rejected:**
```
- Status badge: "Needs Revision" (red)
- Admin feedback displayed in a highlighted box:
  [Feedback from your reviewer]
  "[admin's text here]"
  — HBM Academy Team · [date]
- Previous submission shown (can re-download their own file)
- New file upload dropzone appears (same as State 1)
- "Resubmit" button
- Attempt counter: "This will be attempt #3"
```

**State 4 — Approved:**
```
- Status badge: "Approved ✓" (green)
- "Congratulations! Your submission has been approved."
- Reviewer note (if admin left a note with approval)
- "Continue to Next Lesson →" button
- Next lesson in sidebar is now unlocked (real-time update via Supabase Realtime)
```

**Realtime update for practical approval:**
```typescript
// In PracticalLesson component:
useEffect(() => {
  const channel = supabase
    .channel(`practical:${lessonId}:${studentId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'practical_submissions',
      filter: `lesson_id=eq.${lessonId}&student_id=eq.${studentId}`
    }, (payload) => {
      if (payload.new.status === 'approved') {
        // Update UI to State 4 without page refresh
        setSubmissionStatus('approved')
        // Also update sidebar state
        onLessonComplete()
      } else if (payload.new.status === 'rejected') {
        setSubmissionStatus('rejected')
        setAdminFeedback(payload.new.admin_feedback)
      }
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [lessonId, studentId])
```

---

## 12. Payment Flow (Stripe)

### 12.1 Per-Course Purchase Flow (one-time payment)

```
Student on course landing page
  → Clicks "Buy Now - $XX"
  → POST /api/student/checkout/course { courseId }
  → Server creates Stripe Checkout Session (mode: payment)
  → Server returns { checkoutUrl }
  → Client: window.location.href = checkoutUrl  (redirects to Stripe hosted page)
  → Student completes payment on Stripe
  → Stripe redirects to success_url: /courses/[courseId]/learn/[firstLessonId]?payment=success
  → Stripe fires webhook: checkout.session.completed
  → /api/webhooks/stripe receives event
  → Verifies stripe-signature header
  → Reads metadata.studentId + metadata.courseId
  → Inserts into enrollments table
  → (Student may arrive at learn page before webhook fires — handle gracefully:
       show "Setting up your course..." loading for up to 5 seconds,
       poll enrollment status, then proceed)
```

### 12.2 Subscription Flow (recurring)

```
Student on courses page or course landing page
  → Sees "Subscribe to [Track Name] for $X/month — Unlocks all [N] courses"
  → Clicks subscribe
  → POST /api/student/checkout/subscription { categoryId, priceId }
  → Server creates/retrieves Stripe Customer for student
  → Server creates Stripe Checkout Session (mode: subscription)
  → Client redirects to Stripe hosted page
  → Student subscribes
  → Stripe fires webhook → insert into student_subscriptions
  → Student now has access to all courses in that category
```

### 12.3 Access check with subscription

```typescript
// lib/services/access.service.ts
async function hasAccessToCourse(studentId: string, courseId: string): Promise<boolean> {
  // Check 1: direct enrollment
  const enrollment = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single()

  if (enrollment.data) return true

  // Check 2: active subscription covering this course's category
  const course = await getCourse(courseId) // includes category_id
  const subscription = await supabase
    .from('student_subscriptions')
    .select('id')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .or(`category_id.eq.${course.category_id},category_id.is.null`) // null = all-access
    .gte('current_period_end', new Date().toISOString())
    .single()

  return !!subscription.data
}
```

### 12.4 Stripe environment variables needed
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 13. Certificate Generation

### Flow

```
1. Student completes final lesson in course
2. POST /api/student/progress/[lessonId] marks it complete
3. API calls checkAndIssueCertificate(studentId, courseId)
4. Function checks: totalLessons === completedLessons for this student in this course
5. If yes:
   a. Generate share_token (12-char nanoid)
   b. Build PDF with jsPDF:
      - A4 Landscape (297mm × 210mm)
      - Background: white with branded border pattern
      - HBM Academy logo (center top)
      - "Certificate of Completion" (heading)
      - "This is to certify that" (small text)
      - Student full name (large, 32pt, branded color)
      - "has successfully completed the course" (small)
      - Course title (18pt, bold)
      - Issue date: "15th May 2026"
      - Certificate ID: share_token (small, bottom)
      - Signature area (left): "HBM Academy" with logo
      - Seal/stamp graphic (right bottom)
   c. Convert to PNG using canvas (if supported) or store PDF only initially
   d. Upload PDF to certificates bucket: {studentId}/{courseId}/certificate.pdf
   e. Upload PNG to certificates bucket: {studentId}/{courseId}/certificate.png
   f. Insert into certificates table
6. Return certificate data to API response
7. Client shows success modal with "🎉 Certificate Earned!" + download + LinkedIn share buttons
```

### LinkedIn Share URL
```
https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
  &name=[Course Title]
  &organizationName=HBM+Academy
  &issueYear=[YYYY]
  &issueMonth=[MM]
  &certUrl=https://hbm.academy/c/[shareToken]
  &certId=[shareToken]
```

---

## 14. Discussion Threads

### Per-lesson, threaded, with replies

**Component: `DiscussionThread`**

**Structure:**
```
[Discussion (12 comments)]
                                           [Post a comment ▾]
─────────────────────────────────────────────────────────
[Avatar] StudentName · 2 days ago
         "This lesson really clarified the check-in process for me!"
         [Reply] [♡ 3]

         [Avatar] StudentName2 · 1 day ago      ← Reply (indented)
                  "Agreed! The guest interaction part was especially helpful."
                  [Reply]

[Avatar] AnotherStudent · 3 days ago
         "Can anyone explain why the instructor mentions..."
         [Reply] [♡ 1]
─────────────────────────────────────────────────────────
[Post a comment textarea]
[Cancel] [Post Comment]
```

**Features:**
- Top-level posts + one level of replies (no infinite nesting)
- Sort: Newest first (default), Most liked (toggle)
- "Post a comment" collapses/expands the textarea
- Reply button: expands inline reply textarea under specific post
- Edit: student can edit their own post within 15 minutes of posting
- Delete: soft delete — shows "This comment was deleted" placeholder
- Admin posts: styled differently (gold border, "HBM Team" badge)
- Moderation: admin can pin a post (stays at top), delete any post
- Realtime updates: new posts appear without page refresh via Supabase Realtime

---

## 15. Messaging System

### Conversation-based inbox (not live chat — more like support tickets with quick responses)

**Admin side** (already exists in admin dashboard — `/dashboard/submissions` adjacent):
- Admin sees all conversations from all students
- Can reply, mark as resolved
- Gets notification when student sends first message

**Student side** (to be built):

**`/messages`** — Conversation list:
```
[+ New Message]
─────────────────────────────────────────────────────
🟢 Technical issue with video player       Today  ●
   "Thank you for reaching out! We've looked into..."

   F&B Service course - Module 2 question   Yesterday
   "Hi! Could you clarify the wine service..."
   
─────────────────────────────────────────────────────
```

**`/messages/[conversationId]`** — Thread view:
```
← Back to Messages    [Technical issue with video player]    [Resolved ✓]
───────────────────────────────────────────────────
[Student bubble - right aligned]
"Hi, the video on lesson 3 keeps buffering at 2:30..."
11:30 AM

[Admin bubble - left aligned]  [HBM Team]
"Hello! We've looked into this issue. Please try clearing your cache..."
12:45 PM

[Student bubble - right aligned]
"That worked! Thank you."
1:02 PM
───────────────────────────────────────────────────
[Message input...                           ] [Send]
```

**Realtime:**
```typescript
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new as Message])
    // Mark as read if from admin
  })
  .subscribe()
```

---

## 16. RTL & Bilingual Support

### Architecture

The `lang` and `dir` attributes must be set on the `<html>` element based on the student's language preference. In Next.js App Router, this is done in the root layout.

**Root layout approach:**
```typescript
// app/(student)/layout.tsx
import { cookies } from 'next/headers'

export default async function StudentLayout({ children }) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  const student = user ? await getStudentBySupabaseUid(user.id) : null
  const lang = student?.language ?? 'en'
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={lang} dir={dir}>
      <body>{children}</body>
    </html>
  )
}
```

**Tailwind RTL:**
Tailwind v4 supports `rtl:` variant for RTL-specific styles:
```css
/* Example: margins that flip in RTL */
<div className="ml-4 rtl:ml-0 rtl:mr-4">
<div className="text-left rtl:text-right">
<div className="flex-row rtl:flex-row-reverse">
```

**Translation approach:**
Use a simple `t()` function with JSON translation files (no heavy i18n library needed):
```typescript
// lib/i18n/index.ts
const translations = {
  en: { 'dashboard.title': 'My Learning', 'course.resume': 'Resume Course', ... },
  ar: { 'dashboard.title': 'تعلمي', 'course.resume': 'استكمل الدورة', ... }
}

export function t(key: string, lang: 'en' | 'ar'): string {
  return translations[lang][key] ?? translations['en'][key] ?? key
}
```

**Text content direction:**
- Course titles, descriptions from DB: render in their own language (a course may be Arabic even if UI is English)
- Text lesson content: set `dir` on the content container based on lesson's language field
- User-generated content (discussion posts, messages): wrap in `<div dir="auto">` to auto-detect direction

---

## 17. Component Library

### Reuse from admin (already built — do not rebuild)
These components exist in the admin codebase and must be used/extended for the student side:
```
Button, Input, Label, Checkbox, Select, Switch, RadioGroup, Slider
Dialog, DropdownMenu, NavigationMenu, Separator, Tabs, Toast, Tooltip
Avatar, Badge, Card, Skeleton (loaders)
DataTable (@tanstack/react-table wrapper)
```

### New components to build (student-specific)

**Navigation:**
```
StudentNavbar         — top bar: logo, course search, notifications, avatar dropdown
StudentSidebar        — optional: category nav for catalog pages
CourseSidebarPanel    — lesson list with lock/unlock/complete states (in learn layout)
MobileDrawer          — wraps sidebar in a sheet for mobile
```

**Course catalog:**
```
CourseCard            — thumbnail, title, desc, rating, price, CTA button
CourseGrid            — responsive grid wrapper
CourseFilter          — category, language, price filters
CourseSearch          — debounced search input (300ms)
RatingStars           — display only + interactive (for review form)
```

**Dashboard:**
```
StatCard              — number + label + optional trend arrow
CourseProgressCard    — enrolled course with progress bar + resume button
RecentCertCard        — certificate thumbnail + actions
ProgressRing          — circular progress indicator (SVG)
```

**Lesson player:**
```
VideoPlayer           — <video> wrapper with progress tracking
AudioPlayer           — <audio> wrapper with waveform display
PdfViewer             — <iframe> or react-pdf wrapper
TextContent           — rich text renderer with RTL support
QuizQuestion          — single question with radio options
QuizResult            — score display, pass/fail, explanations
PracticalUpload       — dropzone + file preview + status states
LessonNavigation      — prev/next buttons + mark complete button
```

**Certificates:**
```
CertificateCard       — preview + download + share actions
CertificateViewer     — modal with PDF embed
LinkedInShareButton   — prefilled LinkedIn certification URL
PublicCertPage        — branded certificate display for /c/[shareToken]
```

**Discussions:**
```
DiscussionThread      — full thread component with realtime
DiscussionPost        — individual post with reply/like/delete
DiscussionReply       — nested reply (one level deep)
PostInput             — textarea with submit + cancel
```

**Messaging:**
```
ConversationList      — inbox panel with unread counts
MessageBubble         — single message with timestamp + sender styling
MessageInput          — textarea + send button + realtime
NewConversationModal  — subject + first message form
```

**Utility:**
```
EmptyState            — illustration + message + optional CTA button
LoadingSpinner        — centered spinner for page loads
ProgressBar           — horizontal progress with label
LessonTypeBadge       — colored badge (Video, Audio, Quiz, etc.)
LockIcon              — padlock with tooltip explaining what's needed
LanguageToggle        — EN / AR switch in navbar
```

---

## 18. Security Model

### Media protection
- Videos and audio files are in public Supabase buckets (acceptable for phase 1)
- `<video>` and `<audio>` elements rendered with `controlsList="nodownload"` to remove download button
- `oncontextmenu="return false"` to prevent right-click save
- Video URLs are not directly linked anywhere in the page HTML (loaded dynamically via JS after auth check)
- For production hardening: switch `videos` bucket to private + generate signed URLs server-side with short expiry (1 hour)

### API security
- All `/api/student/*` routes verify Supabase session at the start of every handler
- Use `createServerClient()` from `lib/supabase/server.ts` — never trust client-sent student IDs
- Always derive `studentId` from the session: `const student = await getStudentBySupabaseUid(session.user.id)`
- Stripe webhooks verified with `stripe.webhooks.constructEvent()` and `STRIPE_WEBHOOK_SECRET`
- Admin API routes unchanged — still protected by NextAuth

### RLS
- All new tables have RLS enabled (see section 3.5)
- Students can only read/write their own rows
- Admin operations use `lib/supabase/admin.ts` (service role key — bypasses RLS)

### Input validation
- All API routes validate request body with zod schemas before any DB operation
- File uploads: validate MIME type + size server-side (don't rely on client-side checks)
- Discussion posts + messages: sanitize HTML before storing — use DOMPurify or strip HTML entirely

---

## 19. Build Phases & Order

### Phase 1 — Foundation (Week 1-2)
**Goal:** Students can sign up, log in, and see a working dashboard shell.

1. Write and run Supabase migration (new tables + ALTER statements + triggers + RLS)
2. Create `submissions` storage bucket
3. Update `middleware.ts` to handle both NextAuth (admin) and Supabase (student) routes
4. Build auth pages: `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`
5. Build `StudentContext` + `useStudent()` hook
6. Build student layout shell: `(student)/layout.tsx` with `StudentNavbar`
7. Build student dashboard page (static shell, real data wired in Phase 2)
8. Build profile page (Tab 1: Personal Info)

**Deliverable:** Student can register, verify email, log in, see empty dashboard, edit profile.

---

### Phase 2 — Core Learning (Week 3-4)
**Goal:** Students can browse courses, enroll in free ones, and learn.

1. Build course catalog page with filter + search
2. Build course landing page (public, with enroll CTA)
3. Implement free course enrollment flow (`POST /api/student/enroll`)
4. Build course player layout (sidebar + lesson area + progress bar)
5. Implement mastery engine (`lib/services/mastery.service.ts`)
6. Implement `VideoLesson` component with progress tracking
7. Implement `AudioLesson` component
8. Implement `PdfLesson` component
9. Implement `TextLesson` component with scroll detection
10. Wire up `POST /api/student/progress/[lessonId]`
11. Wire up lesson sidebar with real unlock states

**Deliverable:** Students can take complete video/audio/PDF/text courses, progress is tracked, next lesson unlocks on completion.

---

### Phase 3 — Assessments (Week 5-6)
**Goal:** Quizzes and practical assessments fully functional.

1. Build `QuizLesson` component with all 5 states
2. Implement `GET /api/student/quiz/[lessonId]` (questions without answers)
3. Implement `POST /api/student/quiz/[lessonId]/attempt` (server-side evaluation)
4. Build `PracticalLesson` component with all 4 states
5. Implement `POST /api/student/practical/[lessonId]/submit` (file upload)
6. Implement Supabase Realtime listener for practical approval status
7. Implement DB trigger for practical approval → auto-complete lesson
8. Test full mastery flow: video → quiz → practical → next section

**Deliverable:** Full mastery engine working. Quiz 100% gate enforced. Practical review cycle working end-to-end.

---

### Phase 4 — Payments (Week 7)
**Goal:** Stripe checkout for courses and subscriptions.

1. Implement `POST /api/student/checkout/course`
2. Implement `POST /api/student/checkout/subscription`
3. Implement `POST /api/webhooks/stripe` with all event handlers
4. Wire enroll/subscribe CTAs on course landing page
5. Implement Stripe Customer Portal link in profile billing tab
6. Test full purchase flow (use Stripe test mode)
7. Handle edge cases: webhook arrives before redirect, duplicate enrollment prevention

**Deliverable:** Students can purchase individual courses and subscribe to tracks. Webhook handles all payment outcomes.

---

### Phase 5 — Certificates (Week 8)
**Goal:** Certificates auto-generated and shareable.

1. Implement `checkAndIssueCertificate()` function
2. Design certificate template in jsPDF
3. Implement `POST /api/student/certificates/[courseId]/generate`
4. Build certificate page `/certificates`
5. Build public certificate view `/c/[shareToken]`
6. Add download PDF/PNG + LinkedIn share to profile tab + dashboard
7. Add completion celebration modal/animation when certificate issued

**Deliverable:** Completing a course automatically generates a certificate. Student can download and share it.

---

### Phase 6 — Community & Messaging (Week 9-10)
**Goal:** Discussions and messaging functional.

1. Build `DiscussionThread` component with Realtime
2. Implement discussion API routes
3. Add discussion thread below every lesson player
4. Build messages inbox `/messages`
5. Build conversation thread `/messages/[conversationId]`
6. Implement messaging API routes
7. Wire Realtime for new messages
8. Connect to admin dashboard (admin replies must appear in student inbox)

**Deliverable:** Students can discuss lessons with each other and message HBM team.

---

### Phase 7 — Polish & Production (Week 11-12)
**Goal:** RTL, mobile, performance, final QA.

1. Implement full Arabic RTL layout (test every page in both directions)
2. Language toggle in navbar (updates user preference in DB)
3. Build home/landing page `/`
4. Mobile responsive pass (every page tested at 375px, 768px, 1280px)
5. Add loading skeletons to all data-fetching components
6. Add error boundaries to all major sections
7. Optimize images (Next.js `<Image>` component everywhere)
8. Implement email notifications (Nodemailer) for:
   - Welcome email on registration
   - Practical submission received confirmation
   - Practical approved/rejected notification  
   - Certificate issued notification
9. Performance: add `loading.tsx` files for streaming, use `Suspense` boundaries
10. Final QA against the manual checklist in `QA_MANUAL_CHECKLIST.md`
11. Vercel deployment + environment variables + production Stripe webhook

---

## Environment Variables Needed (Student Side Additions)

Add these to `.env.local` and mirror in Vercel dashboard:

```env
# Supabase (likely already set)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (likely already set for admin)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App URL
NEXT_PUBLIC_APP_URL=https://hbm.academy
```

---

## Key Files to Create (Summary)

```
app/(student)/layout.tsx
app/(student)/dashboard/page.tsx
app/(auth)/auth/login/page.tsx
app/(auth)/auth/register/page.tsx
app/(auth)/auth/forgot-password/page.tsx
app/(auth)/auth/reset-password/page.tsx
app/(public)/courses/page.tsx
app/(public)/courses/[courseId]/page.tsx
app/(public)/c/[shareToken]/page.tsx
app/(student)/courses/[courseId]/learn/layout.tsx
app/(student)/courses/[courseId]/learn/[lessonId]/page.tsx
app/(student)/profile/page.tsx
app/(student)/certificates/page.tsx
app/(student)/messages/page.tsx
app/(student)/messages/[conversationId]/page.tsx

api/student/auth/register/route.ts
api/student/auth/profile/route.ts
api/student/enroll/route.ts
api/student/progress/[lessonId]/route.ts
api/student/quiz/[lessonId]/route.ts
api/student/quiz/[lessonId]/attempt/route.ts
api/student/practical/[lessonId]/submit/route.ts
api/student/practical/[lessonId]/submissions/route.ts
api/student/checkout/course/route.ts
api/student/checkout/subscription/route.ts
api/student/certificates/[courseId]/generate/route.ts
api/student/reviews/[courseId]/route.ts
api/student/discussions/[lessonId]/route.ts
api/student/messages/route.ts
api/student/messages/[conversationId]/route.ts
api/webhooks/stripe/route.ts

lib/services/student.service.ts
lib/services/mastery.service.ts
lib/services/quiz.service.ts
lib/services/practical.service.ts
lib/services/access.service.ts
lib/services/discussions.service.ts
lib/services/messages.service.ts

contexts/StudentContext.tsx
hooks/useStudent.ts
hooks/useLessonProgress.ts
hooks/useRealtime.ts

components/student/StudentNavbar.tsx
components/student/CourseSidebarPanel.tsx
components/student/lesson/VideoLesson.tsx
components/student/lesson/AudioLesson.tsx
components/student/lesson/PdfLesson.tsx
components/student/lesson/TextLesson.tsx
components/student/lesson/QuizLesson.tsx
components/student/lesson/PracticalLesson.tsx
components/student/CourseCard.tsx
components/student/CertificateCard.tsx
components/student/DiscussionThread.tsx
components/student/MessageThread.tsx

supabase/migrations/002_student_side.sql
```

---

*End of HBM Academy Student Side Product Plan — v1.0*  
*This document is the single source of truth for building the student side. Every implementation decision should be validated against it.*
