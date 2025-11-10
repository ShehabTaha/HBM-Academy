import mongoose, { Schema, models } from "mongoose";

const EnrollmentSchema = new Schema(
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
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    progress: {
      type: Number,
      default: 0, // Percentage 0-100
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    lastAccessedLesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
    expiresAt: Date, // For subscription-based courses
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

// Ensure one enrollment per user per course
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ enrolledAt: -1 });

const Enrollment =
  models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema);

export default Enrollment;
