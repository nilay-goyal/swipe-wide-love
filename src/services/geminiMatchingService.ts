
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

export interface User {
  id: string;
  name: string | null;
  skills: string[] | null;
  interests: string[] | null;
  bio: string | null;
  major: string | null;
  school: string | null;
  year: string | null;
  occupation: string | null;
  uiux: number | null;
  pitching: number | null;
  management: number | null;
  hardware: number | null;
  cyber: number | null;
  frontend: number | null;
  backend: number | null;
}

export interface GeminiMatchResult {
  userId: string;
  score: number;
  reasoning: string;
}

export class GeminiMatchingService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  /**
   * Match users based on a Gemini prompt
   */
  async matchUsersWithPrompt(
    userPrompt: string,
    users: User[]
  ): Promise<GeminiMatchResult[]> {
    if (users.length === 0) {
      return [];
    }

    // Prepare user data for Gemini (only essential fields to reduce tokens)
    const userData = users.map(user => ({
      id: user.id,
      name: user.name || 'Anonymous',
      skills: user.skills || [],
      interests: user.interests || [],
      bio: user.bio || '',
      major: user.major || '',
      school: user.school || '',
      occupation: user.occupation || '',
      // Technical skill levels (0-10 scale)
      technical_skills: {
        uiux: user.uiux || 0,
        frontend: user.frontend || 0,
        backend: user.backend || 0,
        hardware: user.hardware || 0,
        cyber: user.cyber || 0,
        management: user.management || 0,
        pitching: user.pitching || 0
      }
    }));

    const prompt = `
You are an expert hackathon team matching AI. I need you to analyze and rank potential teammates based on compatibility with a user's project prompt.

USER'S PROJECT PROMPT:
"${userPrompt}"

POTENTIAL TEAMMATES:
${JSON.stringify(userData, null, 2)}

INSTRUCTIONS:
1. Analyze each user's skills, interests, technical abilities, and background
2. Rate compatibility with the user's prompt (0-100 score)
3. Consider complementary skills, shared interests, and project fit
4. Provide brief reasoning for each match

Please return a JSON array with the following structure:
[
  {
    "userId": "user_id_here",
    "score": 85,
    "reasoning": "Strong backend skills complement your AI project needs, shared interest in fitness tech"
  }
]

Focus on:
- Technical skill complementarity
- Relevant experience and interests
- Potential collaboration value
- Project domain alignment

Return ONLY the JSON array, no additional text.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response:', text);
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const matches = JSON.parse(jsonMatch[0]);
        return matches.sort((a: GeminiMatchResult, b: GeminiMatchResult) => b.score - a.score);
      }
      
      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error in Gemini matching:', error);
      // Fallback: return users in original order with default scores
      return users.map(user => ({
        userId: user.id,
        score: 50,
        reasoning: 'Unable to analyze compatibility at this time'
      }));
    }
  }
}

export const geminiMatchingService = new GeminiMatchingService();
