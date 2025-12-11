// server/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // load .env first

const app = express();

// trust proxy for hosted env (Render/Vercel) so rate limiter uses req.ip correctly
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

// import routes
import authRoutes from "./routes/Auth.js";
import careerRoutes from "./routes/careers.js";
import userRoutes from "./routes/user.js";
import aiRoutes from "./routes/ai.js";

app.use("/api/auth", authRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/results", require("./routes/results"));
import resultsRoutes from "./routes/results.js";
app.use("/api/results", resultsRoutes);


import personalityRoutes from "./routes/personality.js";
app.use("/api/personality", personalityRoutes);

// basic test route
app.get("/", (req, res) => {
  res.json({ message: "CareerIQ backend running 🚀" });
});

// connect to MongoDB and start
mongoose
  .connect(process.env.MONGO_URI, { dbName: "careeriq" })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT || 4000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 4000}`);
      console.log("🔎 ai route file loaded — OPENAI_KEY present?", !!process.env.OPENAI_KEY);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

export default app;
