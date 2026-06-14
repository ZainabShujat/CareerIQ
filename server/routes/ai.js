import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { message, profile, tests } = req.body;

    if (!process.env.OPENAI_KEY) {
      return res.status(500).json({ content: "OpenAI API key is missing from environment variables." });
    }

    const systemPrompt = `You are CareerIQ, an AI career assistant. 
User Profile Info: ${JSON.stringify(profile)}
Test Results: ${JSON.stringify(tests)}
Please provide helpful, concise career advice based on the user's profile and test results.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ content: reply });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ content: "Sorry, there was an error processing your request." });
  }
});

export default router;
