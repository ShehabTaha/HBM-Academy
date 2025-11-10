import mongoose, { Schema, models } from "mongoose";

const DiscussionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Discussion", // For nested replies
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    isInstructor: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Discussion",
      },
    ],
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
DiscussionSchema.index({ course: 1, createdAt: -1 });
DiscussionSchema.index({ lesson: 1, createdAt: -1 });
DiscussionSchema.index({ parentComment: 1 });
DiscussionSchema.index({ isPinned: -1, createdAt: -1 });

const Discussion =
  models.Discussion || mongoose.model("Discussion", DiscussionSchema);

export default Discussion;