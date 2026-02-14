
import { GoogleGenAI, Type } from "@google/genai";
import { QRMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLinkMetadata = async (url: string): Promise<QRMetadata> => {
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

  try {
    const result = JSON.parse(response.text);
    return result as QRMetadata;
  } catch (e) {
    // Fallback if JSON parsing fails
    const domain = new URL(url).hostname.replace('www.', '');
    return {
      title: domain || "My QR Code",
      category: "General",
      suggestedFileName: "qr_code",
      description: `QR link to ${url}`
    };
  }
};
