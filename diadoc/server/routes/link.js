import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();
const ai = new GoogleGenAI({});

router.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: "URL is required" });
    }

    console.log("📡 Analyzing URL:", url);

    const isGithub = url.includes("github.com");

    let prompt;
    if (isGithub) {
      prompt = `Create an accurate ASCII file structure diagram for this GitHub repository URL: ${url}

Generate a realistic file structure for this type of repository.

RULES:
1. Use proper ASCII tree characters: ├──, └──, │
2. Add / after folder names
3. Include common files like package.json, README.md, .gitignore
4. Include typical folders like src/, public/, node_modules/
5. Show realistic file extensions
6. Limit depth to 3-4 levels
7. Make it look professional

Generate ONLY the ASCII diagram, nothing else:`;
    } else {
      prompt = `Create an ASCII file structure diagram based on this documentation URL: ${url}

Generate a logical file structure based on what documentation sites typically have.

RULES:
1. Use proper ASCII tree characters: ├──, └──, │
2. Add / after folder names
3. Include typical doc structure: docs/, assets/, etc.
4. Limit depth to 3-4 levels

Generate ONLY the ASCII diagram, nothing else:`;
    }

    console.log("🤖 Calling Gemini API (gemini-2.5-flash)...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let diagram = response.text?.trim();

    if (!diagram || diagram.length < 10) {
      throw new Error("Generated diagram is too short or empty");
    }

    diagram = diagram.replace(/```[\w]*\n?/g, "").trim();

    console.log("✅ Received response from Gemini");

    res.json({
      success: true,
      diagram,
      metadata: { url, isGithub },
    });
  } catch (error) {
    console.error("❌ Error in link analysis:", error);

    let errorMessage = error.message || "Gemini API error";

    if (error.message?.includes("API key not valid")) {
      errorMessage =
        "Invalid Gemini API key. Please generate a new key at https://aistudio.google.com/app/apikey";
    }

    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;
