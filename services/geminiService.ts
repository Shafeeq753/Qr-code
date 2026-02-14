
import { GoogleGenAI, Type } from "@google/genai";
import { QRMetadata } from "../types.ts";

// Helper function to safely get the AI instance
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getLinkMetadata = async (url: string): Promise<QRMetadata> => {
  const ai = getAI();
  const domain = new URL(url).hostname.replace('www.', '');
  const fallback: QRMetadata = {
    title: domain || "My QR Code",
    category: "General",
    suggestedFileName: "qr_code",
    description: `QR link to ${url}`
  };

  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this URL and provide a concise title, category, a clean filename (no extension), and a short 1-sentence description for a QR code label: ${url}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, readable title for the link" },
            category: { type: Type.STRING, description: "One word category like 'Social', 'Work', 'Event', 'Utility'" },
            suggestedFileName: { type: Type.STRING, description: "Snake_case filename" },
            description: { type: Type.STRING, description: "Brief description of where the link goes" }
          },
          required: ["title", "category", "suggestedFileName", "description"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return { ...fallback, ...result };
  } catch (e) {
    console.error("Gemini AI error:", e);
    return fallback;
  }
};
