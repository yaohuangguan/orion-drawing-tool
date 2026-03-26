const BACKEND_URL = "https://bananaboom-api-242273127238.asia-east1.run.app/api/drawing/generate";

export const generateSVGWithAI = async (prompt: string, currentCode: string): Promise<string> => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        currentCode,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to generate SVG.");
    }

    const { success, data, msg } = await response.json();

    if (success && data) {
        return data;
    }
    
    throw new Error(msg || "No response generated");

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};