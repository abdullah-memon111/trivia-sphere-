import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// In AI Studio, the GEMINI_API_KEY is automatically provided in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestions(category: string, count: number = 10, difficulty: string = 'medium'): Promise<Question[]> {
  const model = "gemini-3-flash-preview";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate exactly ${count} ${difficulty} difficulty trivia questions about "${category}". 
      Ensure incorrect options are plausible and the explanation is a short, interesting fun fact.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The quiz question" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Exactly 4 options"
              },
              correctAnswer: { type: Type.STRING, description: "The matching correct answer" },
              explanation: { type: Type.STRING, description: "Interesting fact about the answer" }
            },
            required: ["text", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const questions = response.text;
    if (!questions) throw new Error("AI returned empty content");
    
    const parsed = JSON.parse(questions);
    
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid output format from AI");
    }

    return parsed.map((q: any, i: number) => ({
      text: q.text || "Unknown Question",
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["A", "B", "C", "D"],
      correctAnswer: q.correctAnswer || "",
      explanation: q.explanation || "No additional context available.",
      id: `q-${i}-${Date.now()}`
    }));
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    // Throwing a cleaner error message for the UI
    throw new Error(error instanceof Error ? error.message : "The AI is currently busy. Please try again in a moment.");
  }
}
