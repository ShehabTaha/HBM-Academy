import mongoose, { Schema, models } from "mongoose";

const ProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    videoProgress: {
      currentTime: Number, // For resume functionality
      duration: Number,
    },
    attempts: {
      type: Number,
      default: 0, // For quizzes/assignments
    },
    score: Number, // For assessments (0-100)
    timeSpent: {
      type: Number,
      default: 0, // in seconds
    },
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

// Ensure one progress record per user per lesson
ProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

const Progress = models.Progress || mongoose.model("Progress", ProgressSchema);

export default Progress;
