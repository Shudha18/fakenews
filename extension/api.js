// A helper to get the API key from storage
const getApiKey = async () => {
    const data = await chrome.storage.local.get('apiKey');
    return data.apiKey;
};

// A basic polyfill for the GoogleGenAI class for the extension environment
class GoogleGenAI {
  constructor() { /* No config needed here */ }
  
  get models() {
    return {
      generateContent: async ({ model, contents, config, apiKey }) => {
          if (!apiKey) {
            throw new Error("API Key not configured. Please set it in the extension popup.");
          }
          
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const isGoogleSearch = config && config.tools && config.tools[0].googleSearch;

          const body = {
              contents: [{ parts: [{ text: contents }] }],
              ...(isGoogleSearch && { tools: [{ googleSearch: {} }] })
          };

          const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`API Error: ${errorData.error.message}`);
          }
          
          const data = await response.json();
          // Simulate the SDK's response structure
          return {
              text: data.candidates[0].content.parts[0].text || '',
              candidates: data.candidates
          };
      }
    };
  }
}


const ai = new GoogleGenAI();

const extractJson = (text) => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error("Failed to parse extracted JSON from markdown:", e);
        }
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse full text as JSON:", e);
    }
    return null;
};

export const analyzeTextInExtension = async (text) => {
    const apiKey = await getApiKey();
    
    const verdicts = 'REAL, LIKELY_REAL, UNCERTAIN, LIKELY_FAKE, FAKE';
    const prompt = `
    Analyze the provided text selection from a webpage to determine if it is real, fake, or misleading.
    
    Text to Analyze:
    ---
    ${text}
    ---

    Perform the following steps:
    1.  Fact-check the main claims using your search capabilities.
    2.  Analyze the language for sensationalism or biased framing.
    3.  Provide a clear verdict, a confidence score (0-100), a concise one-sentence summary, and a list of key reasoning points.

    Respond with ONLY a JSON object in a markdown code block. The structure must be:
    {
      "verdict": "A verdict from this list: ${verdicts}",
      "confidence": "A confidence score from 0 to 100.",
      "summary": "A concise, one-sentence summary.",
      "reasoning": ["A list of key points."]
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
            apiKey: apiKey,
        });
        
        const jsonText = response.text.trim();
        const result = extractJson(jsonText);

        if (!result) {
            throw new Error("AI response was not in the expected JSON format.");
        }
        
        // In the extension, we won't have access to the grounding chunks easily,
        // so we return an empty sources array.
        result.sources = []; 

        if (!verdicts.includes(result.verdict)) {
             result.verdict = 'UNCERTAIN';
        }

        return result;
    } catch (error) {
        console.error("Error analyzing text in extension:", error);
        // Re-throw the original error to be caught by the background script
        throw error;
    }
};
