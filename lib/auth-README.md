# Authentication System Documentation

## Overview
This application uses NextAuth.js v4 for authentication with support for:
- ✅ Credentials (Email/Password)
- ✅ Google OAuth (optional)
- ✅ JWT-based sessions
- ✅ Role-based access control (Student, Lecturer, Admin)
- ✅ Password reset functionality
- ✅ Email verification (ready to implement)

## Files Structure

```
app/api/auth/
├── [..nextauth]/route.ts    # NextAuth configuration
├── register/route.ts         # User registration
├── forgot-password/route.ts  # Password reset request
└── reset-password/route.ts   # Password reset confirmation

lib/
├── auth.ts                   # Server-side auth helpers
├── auth-utils.ts             # Password hashing, validation
└── auth-README.md            # This file

types/
└── next-auth.d.ts            # TypeScript definitions

middleware.ts                 # Route protection
```

## Setup

### 1. Environment Variables

Add to `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-here

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 2. Install Dependencies

Already installed:
- `next-auth@^4.24.13`
- `bcryptjs@^3.0.3`
- `zod@^4.1.12`

## Usage

### Server Components

```typescript
import { getCurrentUser, requireAuth, isAdmin } from "@/lib/auth";

export default async function Page() {
  // Get current user (returns null if not authenticated)
  const user = await getCurrentUser();

  // Require authentication (throws error if not authenticated)
  const user = await requireAuth();

  // Check if admin
  const isUserAdmin = await isAdmin();

  return <div>Hello {user?.name}</div>;
}
```

### API Routes

```typescript
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // Require authentication
    const user = await requireAuth();

    // Or require specific role
    const admin = await requireAdmin();

    return Response.json({ user });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
}
```

### Client Components

```typescript
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <button onClick={() => signIn()}>Sign In</button>;
  }

  return (
    <div>
      <p>Signed in as {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Wrap App with SessionProvider

In `app/layout.tsx`:
```typescript
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

## API Endpoints

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // optional, defaults to "student"
}
```

### Sign In
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}
```

## Role-Based Access Control

### Middleware Protection

Routes are automatically protected by `middleware.ts`:

- `/admin/*` - Admin only
- `/lecturer/*` - Lecturer and Admin
- `/student/*` - Student and Lecturer (not Admin)

### Manual Role Checks

```typescript
import { hasRole, requireRole } from "@/lib/auth";

// Check role
const isLecturer = await hasRole("lecturer");

// Require role (throws error if not authorized)
const user = await requireRole("admin");
```

## Password Security

### Password Requirements
- Minimum 6 characters (configurable)
- Hashed using bcrypt with 10 salt rounds

### Strong Password Validation
```typescript
import { isStrongPassword } from "@/lib/auth-utils";

const result = isStrongPassword("MyPassword123!");
// {
//   isValid: true,
//   errors: []
// }
```

Requirements for strong password:
- At least 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character

## Utility Functions

### Password Hashing
```typescript
import { hashPassword, comparePassword } from "@/lib/auth-utils";

const hash = await hashPassword("password123");
const isMatch = await comparePassword("password123", hash);
```

### Token Generation
```typescript
import { generateToken, generateTokenWithExpiry } from "@/lib/auth-utils";

const token = generateToken(); // Random 32-byte hex string
const { token, expires } = generateTokenWithExpiry(24); // 24 hours
```

### Input Validation
```typescript
import { isValidEmail, sanitizeInput } from "@/lib/auth-utils";

const valid = isValidEmail("test@example.com");
const clean = sanitizeInput("<script>alert('xss')</script>");
```

## OAuth Providers

### Google OAuth Setup

1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Add credentials to `.env.local`

The provider is automatically enabled when credentials are present.

## Session Management

### Session Configuration
- Strategy: JWT
- Max Age: 30 days
- Secure: true (in production)
- HttpOnly: true
- SameSite: lax

### Update Session
```typescript
import { useSession } from "next-auth/react";

const { update } = useSession();

// Update session data
await update({
  name: "New Name",
  email: "new@email.com",
});
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep NEXTAUTH_SECRET secure** - Never commit to git
3. **Implement rate limiting** for auth endpoints
4. **Enable email verification** before allowing access
5. **Use strong password requirements**
6. **Implement 2FA** for sensitive operations
7. **Log authentication events** for security auditing
8. **Implement account lockout** after failed attempts

## Email Integration (TODO)

To enable email functionality:

1. Configure email service in `.env.local`
2. Implement email sending in:
   - Registration confirmation
   - Password reset
   - Email verification
   - Account notifications

Example email service setup:
```typescript
// lib/email.ts
import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}
```

## Troubleshooting

### Common Issues

**"Invalid credentials" error:**
- Check if user exists in database
- Verify password is correct
- Check if user is soft-deleted

**Session not persisting:**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure cookies are enabled

**Role-based access not working:**
- Check middleware.ts configuration
- Verify user role in database
- Check JWT token includes role

**OAuth not working:**
- Verify OAuth credentials
- Check redirect URIs match
- Ensure OAuth provider is enabled

## Testing

### Test User Creation
```typescript
import { hashPassword } from "@/lib/auth-utils";
import User from "@/models/User";

const testUser = await User.create({
  name: "Test User",
  email: "test@example.com",
  password: await hashPassword("password123"),
  role: "student",
  isEmailVerified: true,
});
```

### Test Authentication
```bash
# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Future Enhancements

- [ ] Email verification flow
- [ ] Two-factor authentication (2FA)
- [ ] Social login (GitHub, Facebook)
- [ ] Account lockout after failed attempts
- [ ] Session management dashboard
- [ ] Audit logging
- [ ] Magic link authentication
- [ ] Biometric authentication