import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // No duplicate emails
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "lecturer"], // Only these 3 options
      default: "student",
    },
    avatar: String, // Optional profile picture URL
    phoneNumber: String,
    bio: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true, // Auto-adds createdAt & updatedAt
  }
);

// Prevent model re-compilation during hot reloads
const User = models.User || mongoose.model("User", UserSchema);

export default User;
