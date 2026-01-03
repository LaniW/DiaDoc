import express from "express";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

const router = express.Router();
const ai = new GoogleGenAI({});

/**
 * Fetch actual GitHub repository tree
 */
const fetchGithubTree = async (url) => {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    const [_, user, repo] = match;

    const apiUrl = `https://api.github.com/repos/${user}/${repo}/git/trees/main?recursive=1`;
    const res = await axios.get(apiUrl);

    return res.data.tree
      .filter(item => item.type === "tree" || item.type === "blob")
      .map(item => item.path);
  } catch (err) {
    console.warn("GitHub fetch failed:", err.message);
    return null;
  }
};

router.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: "URL is required" });

    console.log("📡 Analyzing URL:", url);

    const isGithub = url.includes("github.com");
    let prompt = "";

    if (isGithub) {
      const files = await fetchGithubTree(url);
      if (!files || files.length === 0) {
        throw new Error("Could not fetch GitHub repository tree.");
      }

      prompt = `
You are an expert at generating project file structures.
Here is a GitHub repository tree:

${files.join("\n")}

RULES:
- Use proper ASCII tree characters: ├──, └──, │
- Add / after folder names
- Show hierarchy correctly
- Include all files from the list
- Limit depth to 3–4 levels
- Generate ONLY the ASCII diagram
`;
    } else {
      // Documentation link fallback
      prompt = `
You are an expert at generating project file structures.
Analyze the project described in this documentation URL (ignore website structure):
${url}

RULES:
- Use proper ASCII tree characters: ├──, └──, │
- Add / after folder names
- Include typical project folders and files
- Limit depth to 3–4 levels
- Generate ONLY the ASCII diagram
`;
    }

    console.log("🤖 Calling Gemini API...");
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

    res.json({ success: true, diagram, metadata: { url, isGithub } });
  } catch (error) {
    console.error("❌ Error in link analysis:", error);
    res.status(500).json({ success: false, error: error.message || "Gemini API error" });
  }
});

export default router;
