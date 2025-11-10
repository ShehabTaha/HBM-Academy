import mongoose, { Schema, models } from "mongoose";

const ModuleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    order: {
      type: Number,
      default: 0, // For drag-and-drop ordering
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    estimatedDuration: Number, // in minutes
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

const Module = models.Module || mongoose.model("Module", ModuleSchema);

export default Module;
