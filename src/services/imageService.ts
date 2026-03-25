import { GoogleGenAI } from "@google/genai";

// Initialize the SDK with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateTaxImage = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `A professional, high-quality educational illustration for the UAE Federal Tax Authority (FTA). ${prompt}. The style should be clean, modern, corporate, and incorporate UAE architectural elements or the UAE flag colors subtly. No text in the image.`,
            },
          ],
        },
      ],
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    // The response may contain multiple parts, find the one with inlineData
    const candidate = response.candidates?.[0];
    if (candidate && candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    // Fallback if no image data found
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1920/1080?blur=1`;
  } catch (error: any) {
    // Check for 429 (Quota Exceeded) or other errors
    const isQuotaError = error?.status === 429 || 
                        error?.message?.includes('quota') || 
                        error?.message?.includes('429') ||
                        (typeof error === 'string' && error.includes('429'));

    if (isQuotaError) {
      console.warn("AI Image Generation: Quota exceeded. Using high-quality placeholder fallback.");
    } else {
      console.error("Error generating image:", error);
    }
    
    // Return a high-quality placeholder with a seed based on the prompt for consistency
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1920/1080?blur=1`;
  }
};
