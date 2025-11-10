import mongoose, { Schema, models } from "mongoose";

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 5000,
    },
    thumbnail: String, // Cloudinary URL
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    tags: [String],
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    learningOutcomes: [String],
    totalDuration: Number, // in minutes
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    language: {
      type: String,
      default: "en",
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User", // Links to User collection
      required: true,
    },
    pricing: {
      type: {
        type: String,
        enum: ["free", "paid", "subscription"],
        default: "free",
      },
      amount: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    modules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Module", // Array of Module IDs
      },
    ],
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CourseSchema.index({ status: 1, createdAt: -1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ level: 1 });

const Course = models.Course || mongoose.model("Course", CourseSchema);

export default Course;
