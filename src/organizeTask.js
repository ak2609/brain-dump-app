// organizeTask.js
// This is the core AI logic file. It handles:
// 1. Fetching past corrections from Supabase (memory)
// 2. Building a smart prompt that includes those corrections (teaching)
// 3. Calling OpenAI and parsing the response (intelligence)

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for React Native environments
});

// This function takes:
// - inputText: the raw brain dump string from the user
// - corrections: an array of past corrections fetched from Supabase
// It returns: an array of { task, category, urgent } objects

export async function organizeBrainDump(inputText, corrections = []) {
  
  // Build the "learning examples" section of the prompt.
  // If the user has never made corrections, this section will just be empty.
  let correctionExamples = '';
  if (corrections.length > 0) {
    correctionExamples = `
Here are corrections this specific user has made in the past. 
LEARN from these and apply the same logic to new tasks:
${corrections
  .map(c => `- "${c.task_text}" → user prefers category: "${c.user_category}"`)
  .join('\n')}
    `;
  }

  // The system prompt is what tells the AI who it is and what its job is.
  // We inject the user's correction history here dynamically.
  const systemPrompt = `
You are a task extraction and categorization assistant. 
Extract every individual task from the user's brain dump text and assign each 
one to the most appropriate category.

Available categories: Work, Personal, Groceries, Health, Finance, Ideas, Urgent, Other.

Rules:
- Extract EVERY task or to-do, even vague ones
- If something is time-sensitive (deadline today or tomorrow), set urgent to true
- Return ONLY a valid JSON array, no explanation, no markdown, no extra text
- Each item must have: task (string), category (string), urgent (boolean)

${correctionExamples}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cheap — perfect for this use case
      max_tokens: 1000,
      temperature: 0.2, // Low temperature = consistent, predictable categorization
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputText },
      ],
    });

    // The AI response comes back as a string. We need to parse it into a JS array.
    const rawText = response.choices[0].message.content.trim();
    
    // Strip any accidental markdown code fences the model might add
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    
    const tasks = JSON.parse(cleanText);
    return tasks;

  } catch (error) {
    console.error('OpenAI call failed:', error);
    // Return empty array rather than crashing the app
    return [];
  }
}