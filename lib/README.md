# Library Utilities

This directory contains utility functions and configurations for the application.

## Files

### `db.ts`
MongoDB connection manager with the following features:

#### Features:
- ✅ Connection pooling for optimal performance
- ✅ Automatic reconnection on failure
- ✅ Connection status tracking
- ✅ Graceful shutdown handling
- ✅ Environment variable validation
- ✅ Detailed logging

#### Usage:
```typescript
import { connectDB } from "@/lib/db";

// In API routes or server components
await connectDB();
```

#### Environment Variables Required:
```env
MONGODB_URI=mongodb://localhost:27017/hbm-academy
DB_NAME=hbm-academy  # Optional, defaults to "hbm-academy"
```

#### Connection Options:
- **maxPoolSize**: 10 connections
- **minPoolSize**: 2 connections
- **socketTimeoutMS**: 45 seconds
- **serverSelectionTimeoutMS**: 5 seconds
- **retryWrites**: Enabled
- **retryReads**: Enabled

### `db-utils.ts`
Database utility functions for common operations:

#### Functions:

**Soft Delete Operations:**
```typescript
import { softDelete, softDeleteMany, restore } from "@/lib/db-utils";

// Soft delete a document
await softDelete(User, userId);

// Soft delete multiple documents
await softDeleteMany(User, { role: "student" });

// Restore a soft-deleted document
await restore(User, userId);
```

**Query Operations:**
```typescript
import { findActive, findOneActive, countActive } from "@/lib/db-utils";

// Find all active (non-deleted) documents
const users = await findActive(User, { role: "student" });

// Find one active document
const user = await findOneActive(User, { email: "user@example.com" });

// Count active documents
const count = await countActive(User, { role: "admin" });
```

**Pagination:**
```typescript
import { paginate } from "@/lib/db-utils";

const result = await paginate(Course, 
  { status: "published" },
  {
    page: 1,
    limit: 10,
    sort: { createdAt: -1 },
    populate: "instructor",
    select: "title description thumbnail",
  }
);

// Returns:
// {
//   data: [...],
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 50,
//     totalPages: 5,
//     hasNextPage: true,
//     hasPrevPage: false
//   }
// }
```

**Other Utilities:**
```typescript
import { exists, findByIdOrFail, bulkUpsert } from "@/lib/db-utils";

// Check if document exists
const userExists = await exists(User, { email: "test@example.com" });

// Get document or throw error
const course = await findByIdOrFail(Course, courseId, "Course not found");

// Bulk upsert
await bulkUpsert(User, [
  {
    filter: { email: "user1@example.com" },
    update: { name: "User 1" }
  },
  {
    filter: { email: "user2@example.com" },
    update: { name: "User 2" }
  }
]);
```

### `utils.ts`
General utility functions (shadcn/ui utilities).

## Best Practices

### 1. Always Connect Before Queries
```typescript
// In API routes
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const users = await User.find();
  return Response.json(users);
}
```

### 2. Use Soft Deletes
```typescript
// Instead of hard delete
await User.findByIdAndDelete(id); // ❌

// Use soft delete
await softDelete(User, id); // ✅
```

### 3. Use Active Queries
```typescript
// Instead of manual filtering
const users = await User.find({ deletedAt: null }); // ❌

// Use utility
const users = await findActive(User); // ✅
```

### 4. Handle Errors Properly
```typescript
try {
  await connectDB();
  const course = await findByIdOrFail(Course, id);
  // ... rest of code
} catch (error) {
  console.error("Error:", error);
  return Response.json({ error: "Failed to fetch course" }, { status: 500 });
}
```

### 5. Use Pagination for Large Datasets
```typescript
// Instead of fetching all
const courses = await Course.find(); // ❌ Can be slow

// Use pagination
const result = await paginate(Course, {}, { page: 1, limit: 20 }); // ✅
```

## Performance Tips

1. **Use Lean Queries** for read-only operations:
```typescript
const users = await User.find().lean();
```

2. **Select Only Needed Fields**:
```typescript
const users = await User.find().select("name email");
```

3. **Use Indexes** (already configured in models):
```typescript
// Queries will automatically use indexes
const courses = await Course.find({ status: "published" });
```

4. **Batch Operations**:
```typescript
// Instead of multiple updates
for (const user of users) {
  await User.findByIdAndUpdate(user._id, { verified: true }); // ❌
}

// Use bulk operations
await User.updateMany({ _id: { $in: userIds } }, { verified: true }); // ✅
```

## Error Handling

The connection manager includes comprehensive error handling:

- **Connection Errors**: Logged and thrown
- **Disconnection**: Automatically tracked
- **Graceful Shutdown**: SIGINT handler closes connection
- **Missing ENV**: Throws error with helpful message

## Monitoring

Connection events are logged:
- ✅ Connected
- 🔗 Mongoose connected
- ❌ Connection error
- ⚠️ Disconnected
- 👋 Graceful shutdown