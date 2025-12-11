import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
import authRoutes from "./routes/auth.js";
import careerRoutes from "./routes/careers.js";
app.use("/api/careers", careerRoutes);


app.use("/api/auth", authRoutes);



// basic test route
app.get("/", (req, res) => {
  res.json({ message: "CareerIQ backend running 🚀" });
});

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "careeriq",
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // start server only *after* DB connects
    app.listen(process.env.PORT || 4000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 4000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
import userRoutes from "./routes/user.js";
// after your other route registrations (and after app has express.json())
app.use("/api/user", userRoutes);
