import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateContent(prompt: string, model: string = "gemini-3-flash-preview") {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function analyzeImage(prompt: string, base64Image: string, model: string = "gemini-3-flash-preview") {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ],
        },
      ],
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
}
