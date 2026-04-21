import { Question } from "../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateQuestions(category: string, count: number = 10, difficulty: string = 'medium'): Promise<Question[]> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured. Please add it to your environment variables.");
  }

  const systemPrompt = `You are a professional trivia generator. 
  Generate exactly ${count} ${difficulty} difficulty trivia questions about "${category}".
  Return ONLY a raw JSON array of objects.
  
  JSON format:
  [
    {
      "text": "The question string",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "The exact string from the options array",
      "explanation": "A short, interesting fun fact about the answer"
    }
  ]
  
  Rules:
  - Return ONLY raw JSON. No markdown formatting (\`\`\`json).
  - Ensure incorrect options are plausible.
  - The correctAnswer must be one of the options.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${count} questions about ${category}.` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" } // Note: Groq supports this, but we need to ensure the schema is followed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) throw new Error("AI returned empty content");
    
    // Some models might wrap JSON in a root object if response_format: {type: 'json_object'} is used
    // Let's try to parse it directly
    let parsed = JSON.parse(content);
    
    // If the tool forced a top-level object (common for json_object mode), extract the array
    if (!Array.isArray(parsed) && typeof parsed === 'object') {
      const firstArray = Object.values(parsed).find(Array.isArray);
      if (firstArray) {
        parsed = firstArray;
      }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid output format from AI: Not a JSON array.");
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
    throw new Error(error instanceof Error ? error.message : "The AI is currently busy. Please try again in a moment.");
  }
}
