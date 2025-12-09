import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  createdAt: { type: Date, default: Date.now },
  data: mongoose.Schema.Types.Mixed // store matches / score / answers
});

// ensure a default export so `import Result from "../models/Result.js"` works
export default mongoose.model("Result", resultSchema);
