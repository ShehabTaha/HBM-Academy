import mongoose, { Schema, models } from "mongoose";

const AnalyticsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
    eventType: {
      type: String,
      enum: [
        "page_view",
        "course_view",
        "lesson_start",
        "lesson_complete",
        "video_play",
        "video_pause",
        "video_complete",
        "quiz_attempt",
        "quiz_complete",
        "download",
        "search",
        "enrollment",
        "purchase",
      ],
      required: true,
    },
    metadata: Schema.Types.Mixed, // Event-specific data
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
    },
    duration: Number, // Time spent in seconds
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
AnalyticsSchema.index({ user: 1, timestamp: -1 });
AnalyticsSchema.index({ course: 1, timestamp: -1 });
AnalyticsSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ timestamp: -1 });

const Analytics =
  models.Analytics || mongoose.model("Analytics", AnalyticsSchema);

export default Analytics;