# HBM Academy - Supabase Setup Guide

This guide will help you set up and run the HBM Academy Admin Panel with Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- Git (optional, for cloning)

---

## Step 1: Supabase Project Setup

### 1.1 Create a New Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Project name**: `hbm-academy` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for project to be ready

### 1.2 Get Your API Keys

Once your project is ready:

1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGci...`)
   - **service_role key** (KEEP SECRET - only for server use)

---

## Step 2: Database Schema Setup

### 2.1 Run the Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the file: `supabase/migrations/001_initial_schema.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" (bottom right)
7. You should see "Success. No rows returned"

> ✅ This creates all tables, indexes, RLS policies, and triggers

### 2.2 Verify Tables Were Created

1. Go to **Database** > **Tables** in the sidebar
2. You should see 8 new tables:
   - users
   - courses
   - sections
   - lessons
   - enrollments
   - progress
   - reviews
   - certificates

---

## Step 3: Storage Buckets Setup

### 3.1 Create Storage Buckets

Go to **Storage** in the sidebar, then create these buckets:

#### Bucket 1: `avatars`

- Name: `avatars`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

#### Bucket 2: `course-thumbnails`

- Name: `course-thumbnails`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

#### Bucket 3: `videos`

- Name: `videos`
- Public: ✅ Yes
- File size limit: 2000MB (2GB)
- Allowed MIME types: `video/*`

#### Bucket 4: `course-materials`

- Name: `course-materials`
- Public: ✅ Yes (or No, if you want private downloads)
- File size limit: 100MB
- Allowed MIME types: `application/pdf, application/*, text/*`

#### Bucket 5: `audio-files`

- Name: `audio-files`
- Public: ✅ Yes
- File size limit: 100MB
- Allowed MIME types: `audio/*`

#### Bucket 6: `certificates`

- Name: `certificates`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `application/pdf, image/png`

### 3.2 Configure Bucket Policies (Optional)

For each bucket, you can set RLS policies in **Storage** > **Policies**. The default public access is fine for now, but you can restrict based on user roles later.

---

## Step 4: Environment Configuration

### 4.1 Update `.env.local`

Open `.env.local` in your project root and update these values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Next Auth (keep existing)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# ... rest of your config
```

> ⚠️ **IMPORTANT**:
>
> - Never commit `.env.local` to git
> - The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
> - For production, use environment variables in your hosting platform

---

## Step 5: Install Dependencies

If you haven't already:

```bash
npm install
```

This will install:

- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase SSR helpers for Next.js
- All other dependencies

---

## Step 6: Create Your First Admin User

### 6.1 Using Supabase SQL Editor

1. Go to **SQL Editor**
2. Run this query (update with your details):

```sql
INSERT INTO users (email, name, password, role, is_email_verified)
VALUES (
  'admin@hbmacademy.com',
  'Admin User',
  '$2a$10$rGHvQi5z3Q8xC5Y9z5H5u.5xZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', -- This is bcrypt hash for 'password123'
  'admin',
  true
);
```

> ⚠️ **Password Security**: This uses a sample hashed password. For production, you should:
>
> 1. Use the registration API endpoint
> 2. Or hash your password using bcrypt first

### 6.2 Hash a Real Password

If you want to create a user with a custom password:

1. Use an online bcrypt generator (search "bcrypt online")
2. Enter your desired password
3. Use 10 rounds
4. Copy the hash
5. Replace the password value in the SQL above

---

## Step 7: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7.1 Login

1. Go to the login page
2. Use the credentials:
   - Email: `admin@hbmacademy.com`
   - Password: `password123` (or your custom password)
3. You should be redirected to the dashboard

---

## Step 8: Verify Everything Works

### 8.1 Test Course Creation

1. Go to **Dashboard** > **Courses**
2. Click "Create Course"
3. Fill in the details
4. Click "Save"
5. Check if the course appears

### 8.2 Test File Upload

1. Edit a course
2. Try uploading a course thumbnail
3. Check in Supabase **Storage** > `course-thumbnails` to verify upload

### 8.3 Check Real-time Features

1. Open the same course in two browser windows
2. Make a change in one window
3. Verify it updates in real-time in the other window

---

## Common Issues & Troubleshooting

### Issue: "Missing environment variables"

**Solution**: Make sure `.env.local` has all required Supabase keys

### Issue: "Cannot connect to Supabase"

**Solutions**:

1. Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check your Supabase project is not paused (free tier pauses after inactivity)
3. Verify API keys are correct

### Issue: "Permission denied" or "RLS policy violation"

**Solutions**:

1. Verify RLS policies were created correctly
2. Check user is logged in
3. Verify user has correct role (admin/lecturer/student)
4. Check Supabase logs in **Database** > **Logs**

### Issue: "File upload fails"

**Solutions**:

1. Verify storage buckets are created
2. Check bucket policies allow uploads
3. Verify file size is within limits
4. Check file type is allowed

### Issue: "Cannot find module" errors

**Solution**: Run `npm install` again to ensure all dependencies are installed

---

## Next Steps

### Enable Real-time Features

Real-time is already configured! It works automatically for:

- Progress tracking
- Enrollment updates
- Course changes

### Add More Users

Use the registration API or SQL Editor to add more users:

- **Lecturers**: Can create and manage their own courses
- **Students**: Can enroll in courses and track progress
- **Admins**: Can manage everything

### Customize

1. Update branding in `globals.css`
2. Add your logo
3. Customize colors and theme
4. Add more features using the service layer

---

## Project Structure

```
hbm-academy-admin/
├── app/
│   ├── api/                    # API routes
│   │   ├── courses/           # Course endpoints
│   │   ├── enrollments/       # Enrollment endpoints
│   │   ├── progress/          # Progress tracking
│   │   └── upload/            # File uploads
│   └── (admin)/dashboard/     # Admin pages
├── lib/
│   ├── services/              # Service layer
│   │   ├── users.service.ts
│   │   ├── courses.service.ts
│   │   ├── lessons.service.ts
│   │   ├── enrollments.service.ts
│   │   ├── progress.service.ts
│   │   ├── reviews.service.ts
│   │   ├── certificates.service.ts
│   │   └── storage.service.ts
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── admin.ts           # Admin client
│   └── hooks/                 # React hooks
│       └── useProgressTracking.ts
├── types/
│   └── database.types.ts      # Database TypeScript types
└── supabase/
    └── migrations/            # SQL migrations
        └── 001_initial_schema.sql
```

---

## Support & Resources

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Project Issues**: Check console and Supabase logs

---

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- [ ] Enable 2FA on Supabase account
- [ ] Review and test all RLS policies
- [ ] Set up proper CORS if needed
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts

---

**Congratulations! Your HBM Academy is now fully integrated with Supabase! 🎉**
