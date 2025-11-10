import mongoose, { Schema, models } from "mongoose";

const ReviewSchema = new Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per course
ReviewSchema.index({ user: 1, course: 1 }, { unique: true });
ReviewSchema.index({ course: 1, rating: -1 });
ReviewSchema.index({ createdAt: -1 });

const Review = models.Review || mongoose.model("Review", ReviewSchema);

export default Review;