# Database Models Documentation

## Overview
This directory contains all Mongoose schemas for the HBM Academy LMS platform.

## Models

### Core Models

#### 1. **User.ts**
Manages user accounts and authentication.
- **New Fields:**
  - `phoneNumber`: Contact number
  - `bio`: User biography
  - `isEmailVerified`: Email verification status
  - `resetPasswordToken`: Password reset token
  - `resetPasswordExpires`: Token expiration
  - `deletedAt`: Soft delete timestamp

#### 2. **Course.ts**
Manages course information and metadata.
- **New Fields:**
  - `tags`: Array of searchable tags
  - `prerequisites`: Required courses
  - `learningOutcomes`: What students will learn
  - `totalDuration`: Total course duration in minutes
  - `level`: Difficulty level (beginner/intermediate/advanced)
  - `language`: Course language (default: "en")
  - `enrollmentCount`: Number of enrolled students
  - `averageRating`: Average course rating (0-5)
  - `deletedAt`: Soft delete timestamp
- **Indexes:**
  - `status + createdAt`
  - `instructor`
  - `category`
  - `tags`
  - `level`

#### 3. **Module.ts**
Organizes lessons into modules within courses.
- **New Fields:**
  - `isPublished`: Publication status
  - `estimatedDuration`: Estimated completion time
  - `deletedAt`: Soft delete timestamp

#### 4. **Lesson.ts**
Individual learning units with various content types.
- **New Fields:**
  - `isPublished`: Publication status
  - `resources`: Downloadable materials array
  - `deletedAt`: Soft delete timestamp

#### 5. **Enrollment.ts**
Tracks student course enrollments.
- **New Fields:**
  - `expiresAt`: Expiration date for subscriptions
  - `certificateIssued`: Certificate generation status
  - `deletedAt`: Soft delete timestamp
- **Indexes:**
  - `status`
  - `enrolledAt`

#### 6. **Progress.ts**
Tracks student progress through lessons.
- **New Fields:**
  - `attempts`: Number of quiz/assignment attempts
  - `score`: Assessment score (0-100)
  - `timeSpent`: Time spent in seconds
  - `deletedAt`: Soft delete timestamp

#### 7. **Transaction.ts**
Manages payment transactions.
- **New Fields:**
  - `receiptUrl`: Payment receipt URL
  - `refundReason`: Reason for refund
  - `refundedAt`: Refund timestamp
  - `metadata`: Additional payment information
  - `deletedAt`: Soft delete timestamp

#### 8. **Certificates.ts**
Manages course completion certificates.
- **New Fields:**
  - `expiresAt`: Certificate expiration date
  - `verificationUrl`: Public verification URL
  - `metadata`: Custom certificate data
  - `deletedAt`: Soft delete timestamp

### New Models

#### 9. **Review.ts** ⭐ NEW
Course reviews and ratings system.
- **Fields:**
  - `user`: Reviewer reference
  - `course`: Course reference
  - `rating`: 1-5 star rating
  - `comment`: Review text (max 1000 chars)
  - `isVerifiedPurchase`: Purchase verification
  - `helpfulCount`: Helpful votes count
- **Indexes:**
  - `user + course` (unique)
  - `course + rating`
  - `createdAt`

#### 10. **Notification.ts** ⭐ NEW
User notification system.
- **Fields:**
  - `user`: Recipient reference
  - `type`: Notification category
  - `title`: Notification title
  - `message`: Notification content
  - `link`: Action URL
  - `isRead`: Read status
  - `readAt`: Read timestamp
  - `metadata`: Additional context
- **Indexes:**
  - `user + isRead`
  - `user + createdAt`
  - `type`

#### 11. **Discussion.ts** ⭐ NEW
Course discussion and Q&A system.
- **Fields:**
  - `user`: Author reference
  - `course`: Course reference
  - `lesson`: Optional lesson reference
  - `parentComment`: For nested replies
  - `content`: Discussion content
  - `isInstructor`: Instructor flag
  - `isPinned`: Pin status
  - `upvotes`: Vote count
  - `upvotedBy`: Users who upvoted
  - `replies`: Reply references
- **Indexes:**
  - `course + createdAt`
  - `lesson + createdAt`
  - `parentComment`
  - `isPinned + createdAt`

#### 12. **Category.ts** ⭐ NEW
Course categorization system.
- **Fields:**
  - `name`: Category name
  - `slug`: URL-friendly identifier
  - `description`: Category description
  - `icon`: Icon identifier
  - `color`: UI color code
  - `parentCategory`: For subcategories
  - `order`: Display order
  - `isActive`: Active status
  - `courseCount`: Number of courses
- **Indexes:**
  - `slug`
  - `isActive + order`
  - `parentCategory`

#### 13. **Analytics.ts** ⭐ NEW
User behavior and course analytics.
- **Fields:**
  - `user`: User reference
  - `course`: Optional course reference
  - `lesson`: Optional lesson reference
  - `eventType`: Type of event tracked
  - `metadata`: Event-specific data
  - `sessionId`: Session identifier
  - `ipAddress`: User IP
  - `userAgent`: Browser info
  - `deviceType`: Device category
  - `duration`: Time spent
  - `timestamp`: Event time
- **Indexes:**
  - `user + timestamp`
  - `course + timestamp`
  - `eventType + timestamp`
  - `timestamp`

## Best Practices

### Soft Deletes
All models include a `deletedAt` field for soft deletion. To implement:
```javascript
// Soft delete
await Model.findByIdAndUpdate(id, { deletedAt: new Date() });

// Query excluding deleted
Model.find({ deletedAt: null });
```

### Validation
- Use `maxlength` for string fields to prevent abuse
- Use `min`/`max` for numeric fields
- Use `enum` for controlled values
- Use `required` for mandatory fields

### Indexes
- Compound indexes for common query patterns
- Single indexes for frequently filtered fields
- Unique indexes for business constraints

### References
- Use `Schema.Types.ObjectId` with `ref` for relationships
- Populate references when needed for performance
- Consider denormalization for frequently accessed data

## Migration Notes

When updating existing data:
1. Run migrations to add new fields with default values
2. Update application code to handle new fields
3. Update API documentation
4. Test thoroughly before deploying

## Performance Tips

1. **Use Lean Queries**: For read-only operations
2. **Select Specific Fields**: Don't fetch unnecessary data
3. **Use Indexes**: Ensure queries use appropriate indexes
4. **Batch Operations**: Use `bulkWrite` for multiple updates
5. **Cache Frequently Accessed Data**: Use Redis for hot data