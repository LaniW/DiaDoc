import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();
const ai = new GoogleGenAI({});

/**
 * Extract project-relevant sentences from documentation text
 */
const extractProjectText = (docText) => {
  return docText
    .split(/[\.\n]/)
    .filter(s => /folder|file|directory|module/i.test(s))
    .join(". ");
};

router.post("/analyze", async (req, res) => {
  try {
    const { docText } = req.body;
    if (!docText) {
      return res.status(400).json({ success: false, error: "Documentation text is required" });
    }

    console.log("📝 Analyzing documentation text...");
    const projectText = extractProjectText(docText);

    const prompt = `
You are an expert at generating ASCII file structure diagrams for software projects.

Input type: <GitHub repo / Documentation URL / Documentation text>

Project information:
<preprocessed project info: nested tree OR extracted text>

RULES:
- Use proper ASCII tree characters: ├──, └──, │
- Add / after folder names
- Maintain correct hierarchy
- Limit depth to 3–4 levels
- Generate ONLY the ASCII diagram

`;

    console.log("🤖 Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let diagram = response.text?.trim();
    if (!diagram || diagram.length < 10) {
      throw new Error("Generated diagram is empty or invalid");
    }

    diagram = diagram.replace(/```[\w]*\n?/g, "").trim();
    console.log("✅ Gemini response received");

    res.json({ success: true, diagram, metadata: { inputLength: docText.length } });
  } catch (error) {
    console.error("❌ Error in docs analysis:", error);
    res.status(500).json({ success: false, error: error.message || "Gemini API error" });
  }
});

export default router;
