// server/seedCareers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Career from "./models/Career.js";
import fs from "fs";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: "careeriq" });

  const careersRaw = fs.readFileSync("./data/careers.json", "utf8");
  const careers = JSON.parse(careersRaw);

  await Career.deleteMany({});
  await Career.insertMany(careers);

  console.log("🌱 Seeded careers:", careers.length);
  process.exit();
}

seed();
