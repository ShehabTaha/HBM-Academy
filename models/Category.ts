import mongoose, { Schema, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    icon: String, // Icon name or URL
    color: String, // Hex color for UI
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category", // For subcategories
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    courseCount: {
      type: Number,
      default: 0,
    },
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1, order: 1 });
CategorySchema.index({ parentCategory: 1 });

const Category = models.Category || mongoose.model("Category", CategorySchema);

export default Category;