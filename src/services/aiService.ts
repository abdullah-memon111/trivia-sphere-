import { Question } from "../types";

/**
 * Generates quiz questions using Pollinations AI (no API key required).
 */
export async function generateQuestions(category: string, count: number = 10, difficulty: string = 'medium'): Promise<Question[]> {
  const systemPrompt = `You are a professional trivia generator. 
  Generate exactly ${count} ${difficulty} difficulty trivia questions about "${category}".
  Return ONLY a raw JSON array of objects. 
  Each object must have: 
  - "text": string
  - "options": array of 4 strings
  - "correctAnswer": string (must exactly match one of the options)
  - "explanation": string (brief interesting fact)
  Do not include markdown formatting or any text outside the JSON.`;

  const url = `https://text.pollinations.ai/${encodeURIComponent(systemPrompt)}?json=true&seed=${Date.now()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch questions from AI");

    const text = await response.text();
    // Sometimes the API might still wrap it in markdown or return extra text, 
    // so we try to extract the JSON array part.
    const jsonMatch = text.match(/\[.*\]/s);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) throw new Error("Invalid response format");

    return parsed.map((q: any, i: number) => ({
      ...q,
      id: `q-${i}-${Date.now()}`
    }));
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
