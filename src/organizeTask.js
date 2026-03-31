// organizeTask.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, 
});

export async function organizeBrainDump(inputText, corrections = [], customTags = []) {
  
  const baseCategories = ['Unsorted', 'Work', 'Personal', 'Groceries', 'Health', 'Finance', 'Ideas', 'Urgent', 'Other'];
  const allCategories = [...baseCategories, ...(customTags || []).map(t => t.name)].join(', ');

  let customCategoriesText = '';
  if (customTags && customTags.length > 0) {
    customCategoriesText = `
User-defined custom categories:
${customTags.map(tag => `- ${tag.name}: ${tag.description}`).join('\n')}
    `;
  }

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

  const systemPrompt = `
You are a highly advanced task extraction and categorization assistant.
Current Date and TimeContext: ${new Date().toISOString()}

Extract every individual task from the user's brain dump text and assign each 
one to the most appropriate category and schema.

Available categories: ${allCategories}
If you cannot confidently classify a task, assign it to "Unsorted".

Rules:
- Extract EVERY task or to-do, even vague ones. Deduplicate identical tasks silently.
- Translate natural language dates ("tomorrow at 5pm", "next Sunday") into strict ISO 8601 strings relative to the provided Current Date.
- Return ONLY a valid JSON array of objects, no explanation, no markdown.

Task Schema (MUST MATCH EXACTLY):
{
  "task": string (The task title, capitalized reasonably),
  "category": string (From the allowed categories),
  "priority": "High" | "Medium" | "Low",
  "dueDate": string (ISO 8601 format) or null if not stated,
  "hasTime": boolean (true if the user specified an explicit time like 5pm, false if just a date like "tomorrow"),
  "recurring": "daily" | "weekly" | "monthly" | "weekdays" | null,
  "confidence": number (float between 0.0 and 1.0 indicating confidence in the chosen category)
}

${customCategoriesText}

${correctionExamples}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      temperature: 0.1, 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputText },
      ],
    });

    const rawText = response.choices[0].message.content.trim();
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return [];
  }
}