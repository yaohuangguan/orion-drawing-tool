import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are VectorVerse, an expert AI SVG generator and assistant.
Your goal is to generate clean, efficient, and visually appealing SVG code based on user requests.

RULES:
1. Output ONLY the raw SVG code. Do not wrap it in markdown code blocks (e.g., no \`\`\`svg ... \`\`\`).
2. Do not include any explanatory text before or after the code unless the user explicitly asks for an explanation. The output should be directly renderable.
3. If the user asks to modify existing SVG, strictly adhere to their modification request while maintaining the integrity of the rest of the image.
4. Ensure the SVG has a 'xmlns="http://www.w3.org/2000/svg"' attribute.
5. Default to a viewBox of "0 0 512 512" if size is not specified.
6. Use semantic IDs and classes where helpful.
7. Be creative! If the user gives a vague prompt (e.g., "cool abstract background"), use your reasoning capabilities to design something complex and beautiful.
`;

export const generateSVGWithAI = async (prompt: string, currentCode: string): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Construct the full prompt context
  const fullPrompt = `
  Current SVG Code:
  ${currentCode}

  User Request:
  ${prompt}

  Generate the updated or new SVG code now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // High thinking budget for complex visual reasoning
        thinkingConfig: {
            thinkingBudget: 32768, 
        },
        // We do NOT set maxOutputTokens to avoid truncating large SVG files
      }
    });

    if (response.text) {
        return response.text;
    }
    
    throw new Error("No response generated");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};