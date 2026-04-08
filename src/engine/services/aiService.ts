import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service for Studio Boss Narrative Engine
 * Uses Gemini 2.0 Flash for variety generation and JSON-structured output.
 */

// The PR Spin Doctor: Fetch API Key from environment to prevent leaks in repo history.
const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export const AIService = {
  /**
   * Generates a batch of narrative templates for a specific domain/sub-domain/tier.
   */
  async generateNarrativeBatch(
    domain: string,
    subDomain: string,
    tier: string,
    count: number = 10,
    options: { 
      styleGuide?: string, 
      history?: string[], 
      tone?: string 
    } = {}
  ): Promise<string[]> {
    const { 
      styleGuide = "Snarky, Hollywood-cynical, fast-paced.", 
      history = [], 
      tone = "Standard" 
    } = options;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are the "Autonomous Content Loop" for Studio Boss, a Hollywood simulation game.
      Your task is to generate fresh narrative templates for the following category:
      - Domain: ${domain}
      - Sub-Domain: ${subDomain}
      - Tier: ${tier}
      - Tone: ${tone}
      
      Style Guide: ${styleGuide}
      
      ${history.length > 0 ? `HISTORY CONTEXT (Use these to create continuing arcs): \n${history.join('\n')}` : ''}
      
      Requirements:
      1. Generate EXACTLY ${count} unique templates.
      2. Templates must be strings.
      3. Use placeholders like {{actor}}, {{target}}, {{project}}, {{body}}, {{amount}}, {{pct}}, {{genre}}, {{platform}} where appropriate.
      4. Ensure maximum variety and snarky industry flavor.
      5. Return as a JSON object with a "templates" key containing the array of strings.
      
      Contextual Examples:
      - "Awards.won": "A triumphant victory at the {{body}} for the entire team behind \\"{{project}}\\"."
      - "Review.Panned": "A directory-to-dumpster fire. {{project}} fails on every level."
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const parsed = JSON.parse(text);
      
      if (parsed && Array.isArray(parsed.templates)) {
        return parsed.templates;
      }
      return [];
    } catch (error) {
      console.error('Gemini Narrative Generation Error:', error);
      return [];
    }
  }
};
