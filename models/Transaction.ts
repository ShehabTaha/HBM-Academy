import mongoose, { Schema, models } from "mongoose";

const TransactionSchema = new Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: String,
    stripePaymentIntentId: String, // Stripe reference
    stripeCustomerId: String,
    receiptUrl: String,
    refundReason: String,
    refundedAt: Date,
    metadata: Schema.Types.Mixed, // Additional payment info
    deletedAt: Date, // Soft delete
  },
  {
    timestamps: true,
  }
);

const Transaction =
  models.Transaction || mongoose.model("Transaction", TransactionSchema);

export default Transaction;
