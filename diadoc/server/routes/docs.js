import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();
const ai = new GoogleGenAI({});

router.post("/analyze", async (req, res) => {
  try {
    const { docText } = req.body;

    if (!docText) {
      return res.status(400).json({
        success: false,
        error: "Documentation text is required",
      });
    }
    console.log("📝 Analyzing documentation text...");
    const prompt = `Analyze this documentation and extract the file/folder structure mentioned.

Documentation:
${docText}

RULES:
1. Extract any explicitly mentioned files and folders
2. Look for phrases like "in the src folder", "create a file called", etc.
3. Infer logical structure from context
4. Use proper ASCII tree characters: ├──, └──, │
5. Add / after folder names
6. Create a clear hierarchy
7. Limit depth to 3–4 levels

Generate ONLY the ASCII diagram, nothing else.`;

    console.log("🤖 Calling Gemini API (gemini-2.5-flash)...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let diagram = response.text?.trim();

    if (!diagram || diagram.length < 10) {
      throw new Error("Generated diagram is empty or invalid");
    }

    // Clean markdown code fences
    diagram = diagram.replace(/```[\w]*\n?/g, "").trim();

    console.log("✅ Gemini response received");

    res.json({
      success: true,
      diagram,
      metadata: { inputLength: docText.length },
    });
  } catch (error) {
    console.error("❌ Error in docs analysis:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Gemini API error",
    });
  }
});

export default router;
