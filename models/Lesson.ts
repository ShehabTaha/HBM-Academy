import mongoose, { Schema, models } from "mongoose";

const LessonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: [
        "video",
        "text",
        "pdf",
        "quiz",
        "assignment",
        "live",
        "presentation",
      ],
      required: true,
    },
    content: {
      // Different based on contentType
      videoUrl: String,
      textContent: String,
      pdfUrl: String,
      quizData: Schema.Types.Mixed,
      assignmentData: Schema.Types.Mixed,
      zoomLink: String,
      presentationUrl: String,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    duration: Number, // In minutes
    isFree: {
      type: Boolean,
      default: false, // Preview lessons
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["pdf", "doc", "video", "link", "other"],
        },
      },
    ],
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

const Lesson = models.Lesson || mongoose.model("Lesson", LessonSchema);

export default Lesson;
