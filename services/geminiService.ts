import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from "../types";
import { Verdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts a JSON object from a string. It looks for a JSON markdown block
 * and falls back to parsing the whole string.
 * @param text The string containing the JSON.
 * @returns The parsed JSON object or null if parsing fails.
 */
const extractJson = (text: string): any => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
        }
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse text as JSON:", e);
    }
    return null;
};

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
    const verdicts = Object.values(Verdict).join(', ');

    const prompt = `
    Analyze the provided content, which is either a news article's full text or a URL to a news article. Your goal is to determine if it is real, fake, or misleading. 
    
    Content to Analyze:
    ---
    ${text}
    ---

    Perform the following steps:
    1.  First, determine if the input is a URL or a block of text. If it is a URL, access it.
    2.  Fact-check the main claims using your search capabilities, looking for independent, credible sources.
    3.  Analyze the language for sensationalism, emotional manipulation, or biased framing.
    4.  Provide a clear verdict, a confidence score, a summary of your findings, and a few key reasoning points.

    Respond with ONLY a JSON object in a markdown code block. The JSON object must conform to this structure:
    {
      "verdict": "A verdict from this list: ${verdicts}",
      "confidence": "A confidence score from 0 to 100 for the verdict.",
      "summary": "A concise, one-sentence summary of the analysis.",
      "reasoning": ["A list of key points explaining the verdict."]
    }

    Do not include any other text or explanation outside the JSON markdown block.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const jsonText = response.text.trim();
        const result = extractJson(jsonText);

        if (!result) {
            throw new Error("AI response was not in the expected JSON format.");
        }

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map((chunk: any) => chunk.web)
            .filter((web: any) => web && web.uri && web.title)
            .map((web: any) => ({ url: web.uri, title: web.title.trim() }));
            
        if (!Object.values(Verdict).includes(result.verdict as Verdict)) {
             console.warn(`Received invalid verdict: ${result.verdict}. Defaulting to UNCERTAIN.`);
             result.verdict = Verdict.UNCERTAIN;
        }

        return { ...result, sources };
    } catch (error) {
        console.error("Error analyzing text with Gemini:", error);
        throw new Error("Failed to analyze text. The AI model may be temporarily unavailable or returned an invalid response.");
    }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImage = async (image: File, promptText: string): Promise<AnalysisResult> => {
    const verdicts = Object.values(Verdict).join(', ');
    const imagePart = await fileToGenerativePart(image);
    
    const textPart = { text: `
        Analyze the attached image for authenticity. Your goal is to determine if it is real, manipulated, or AI-generated.
        
        User's question about the image (if any): "${promptText || 'No specific question asked.'}"
        
        Perform the following steps:
        1. Scrutinize the image for signs of digital manipulation, such as inconsistencies in lighting, shadows, reflections, or textures.
        2. Look for artifacts commonly associated with AI-generated images (e.g., from GANs or diffusion models), like distorted hands, nonsensical text, or unnatural patterns.
        3. If the user provided a question or context, use your search capabilities to verify if the image is being used in a misleading context (e.g., an old photo presented as a recent event).
        4. Provide a clear verdict, a confidence score, a summary of your findings, and key reasoning points.

        Respond with ONLY a JSON object in a markdown code block. The JSON object must conform to this structure:
        {
          "verdict": "A verdict from this list: ${verdicts}",
          "confidence": "A confidence score from 0 to 100 for the verdict.",
          "summary": "A concise, one-sentence summary of the analysis.",
          "reasoning": ["A list of key points explaining the verdict."]
        }

        Do not include any other text or explanation outside the JSON markdown block.
    `};

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const jsonText = response.text.trim();
        const result = extractJson(jsonText);

        if (!result) {
            throw new Error("AI response was not in the expected JSON format.");
        }

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map((chunk: any) => chunk.web)
            .filter((web: any) => web && web.uri && web.title)
            .map((web: any) => ({ url: web.uri, title: web.title.trim() }));
            
        if (!Object.values(Verdict).includes(result.verdict as Verdict)) {
             console.warn(`Received invalid verdict: ${result.verdict}. Defaulting to UNCERTAIN.`);
             result.verdict = Verdict.UNCERTAIN;
        }

        return { ...result, sources };
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw new Error("Failed to analyze image. The AI model may be temporarily unavailable or returned an invalid response.");
    }
};