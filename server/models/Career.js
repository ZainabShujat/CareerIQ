// server/models/Career.js
import mongoose from "mongoose";

const CareerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },   // short id like "se"
  slug: { type: String, required: true, unique: true }, // url slug like "software-engineer"
  title: { type: String, required: true },
  short: { type: String },
  long: { type: String },
  salary: { type: String },
  tags: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Career", CareerSchema);