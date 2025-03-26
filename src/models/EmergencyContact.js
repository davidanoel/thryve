import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    notificationPreferences: {
      alertThreshold: {
        type: String,
        enum: ["high", "critical"],
        default: "critical",
      },
      methods: [
        {
          type: String,
          enum: ["email", "sms"],
          default: ["email"],
        },
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationExpires: Date,
    lastNotified: Date,
    notes: String,
  },
  { timestamps: true }
);

// Index for quick lookups
emergencyContactSchema.index({ userId: 1 });

const EmergencyContact =
  mongoose.models.EmergencyContact || mongoose.model("EmergencyContact", emergencyContactSchema);

export default EmergencyContact;
