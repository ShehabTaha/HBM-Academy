import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "course_update",
        "new_lesson",
        "enrollment",
        "certificate",
        "payment",
        "announcement",
        "reminder",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    link: String, // URL to navigate when clicked
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    metadata: Schema.Types.Mixed, // Additional context data
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });

const Notification =
  models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;