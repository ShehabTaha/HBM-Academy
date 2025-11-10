import mongoose, { Schema, models } from "mongoose";

const CertificateSchema = new Schema(
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
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    certificateUrl: {
      type: String,
      required: true, // Generated PDF/Image URL
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    certificateId: {
      type: String,
      unique: true, // Unique verification code
    },
    expiresAt: Date, // For certifications that expire
    verificationUrl: String,
    metadata: Schema.Types.Mixed, // Custom certificate data
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

const Certificate =
  models.Certificate || mongoose.model("Certificate", CertificateSchema);

export default Certificate;
