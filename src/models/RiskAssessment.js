import mongoose from "mongoose";

const riskAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    factors: [
      {
        type: {
          type: String,
          enum: ["mood", "sleep", "social", "stress", "language"],
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        description: String,
        concerns: [String],
      },
    ],
    triggers: [
      {
        type: String,
        description: String,
        timestamp: Date,
      },
    ],
    lastAssessment: {
      type: Date,
      required: true,
      default: Date.now,
    },
    alertsSent: [
      {
        type: {
          type: String,
          enum: ["user", "emergency_contact", "professional"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        acknowledged: {
          type: Boolean,
          default: false,
        },
      },
    ],
    notes: String,
  },
  { timestamps: true }
);

// Index for quick lookups
riskAssessmentSchema.index({ userId: 1, lastAssessment: -1 });

const RiskAssessment =
  mongoose.models.RiskAssessment || mongoose.model("RiskAssessment", riskAssessmentSchema);

export default RiskAssessment;
