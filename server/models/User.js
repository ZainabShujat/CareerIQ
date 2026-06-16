import mongoose from "mongoose";

// Skill Test Results
const SkillResultSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  score: { type: Number, required: true },
  details: mongoose.Schema.Types.Mixed,
  takenAt: { type: Date, default: Date.now }
});

// Personality Test Result
const PersonalitySchema = new mongoose.Schema({
  scores: mongoose.Schema.Types.Mixed,   // { Analytical, Social, ... }
  answers: [Number],
  timestamp: { type: Date, default: Date.now }
});

// Happiness Index
const HappinessSchema = new mongoose.Schema({
  happiness: Number,
  stability: Number,
  money: Number
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  personality: PersonalitySchema,
  careerOrientation: mongoose.Schema.Types.Mixed,
  orientationAnswers: [Number],
  results: [SkillResultSchema],
  happinessIndex: HappinessSchema
});

export default mongoose.model("User", UserSchema);

