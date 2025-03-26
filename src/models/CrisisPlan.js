import mongoose from "mongoose";

const CrisisPlanSchema = new mongoose.Schema({
  userId: String,
  emergencyContacts: [String],
  warningSigns: [String],
  copingStrategies: [String],
  professionalHelp: [String],
  safePlaces: [String],
  personalStrengths: [String],
  createdAt: Date,
  updatedAt: Date,
});

export default mongoose.models.CrisisPlan || mongoose.model("CrisisPlan", CrisisPlanSchema);
