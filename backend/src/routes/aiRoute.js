const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze wallet and generate insight
router.post("/ai-report", async (req, res) => {
  try {
    const { reportData, userPrompt } = req.body;

    const baseContext = `
      You are an AI financial analyst that reviews crypto wallets.
      Given this data, predict gains/losses, risk level, and portfolio advice.

      Report:
      ${JSON.stringify(reportData, null, 2)}

      User question:
      ${userPrompt || "Give a brief summary of their portfolio."}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional crypto financial advisor." },
        { role: "user", content: baseContext },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const aiInsight = completion.choices[0].message.content;

    res.status(200).json({ aiInsight });
  } catch (err) {
    console.error("AI Report Error:", err);
    res.status(500).json({ error: "AI report generation failed." });
  }
});

module.exports = router;
