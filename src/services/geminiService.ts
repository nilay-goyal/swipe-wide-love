import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

export interface ProjectMatchAnalysis {
  compatibilityScore: number;
  reasoning: string;
  suggestedRoles: string[];
  potentialChallenges: string[];
}

export interface HackathonGoalMatch {
  goalCompatibility: number;
  teamVibeMatch: number;
  overallCompatibility: number;
  reasoning: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Analyze project compatibility between two users
   */
  async analyzeProjectCompatibility(
    user1Project: string,
    user2Project: string,
    user1Skills: string[],
    user2Skills: string[]
  ): Promise<ProjectMatchAnalysis> {
    const prompt = `
You are an expert hackathon team matching AI. Analyze the compatibility between two users' project ideas and skills.

User 1 Project Ideas: ${user1Project}
User 1 Skills: ${user1Skills.join(', ')}

User 2 Project Ideas: ${user2Project}
User 2 Skills: ${user2Skills.join(', ')}

Please provide a JSON response with the following structure:
{
  "compatibilityScore": number (0-1),
  "reasoning": "string explaining the compatibility",
  "suggestedRoles": ["array of suggested roles for each person"],
  "potentialChallenges": ["array of potential challenges they might face"]
}

Focus on:
- Technical skill complementarity
- Project idea alignment
- Potential for collaboration
- Innovation potential
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error analyzing project compatibility:', error);
      return {
        compatibilityScore: 0.5,
        reasoning: 'Unable to analyze compatibility at this time',
        suggestedRoles: ['Developer', 'Designer'],
        potentialChallenges: ['Communication', 'Time management']
      };
    }
  }

  /**
   * Analyze hackathon goal compatibility
   */
  async analyzeHackathonGoals(
    user1Goals: string[],
    user2Goals: string[],
    user1Skills: string[],
    user2Skills: string[]
  ): Promise<HackathonGoalMatch> {
    const prompt = `
You are an expert hackathon team matching AI. Analyze the compatibility of hackathon goals between two users.

User 1 Goals: ${user1Goals.join(', ')}
User 1 Skills: ${user1Skills.join(', ')}

User 2 Goals: ${user2Goals.join(', ')}
User 2 Skills: ${user2Skills.join(', ')}

Please provide a JSON response with the following structure:
{
  "goalCompatibility": number (0-1),
  "teamVibeMatch": number (0-1),
  "overallCompatibility": number (0-1),
  "reasoning": "string explaining the compatibility"
}

Consider:
- Goal alignment (winning, learning, networking, fun)
- Team dynamics potential
- Skill complementarity for achieving goals
- Work style compatibility
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error analyzing hackathon goals:', error);
      return {
        goalCompatibility: 0.5,
        teamVibeMatch: 0.5,
        overallCompatibility: 0.5,
        reasoning: 'Unable to analyze goals at this time'
      };
    }
  }

  /**
   * Generate project suggestions based on user skills and interests
   */
  async generateProjectSuggestions(
    skills: string[],
    interests: string[],
    hackathonGoals: string[]
  ): Promise<string[]> {
    const prompt = `
You are an expert hackathon project ideation AI. Generate 3 innovative project ideas based on the user's profile.

User Skills: ${skills.join(', ')}
User Interests: ${interests.join(', ')}
Hackathon Goals: ${hackathonGoals.join(', ')}

Please provide a JSON response with the following structure:
{
  "projectIdeas": [
    {
      "title": "string",
      "description": "string",
      "techStack": ["array of technologies"],
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}

Focus on:
- Feasibility within hackathon timeframe
- Innovation and creativity
- Alignment with user's skills and goals
- Market potential or social impact
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.projectIdeas.map((idea: any) => 
          `${idea.title}: ${idea.description} (${idea.techStack.join(', ')})`
        );
      }
      
      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error generating project suggestions:', error);
      return [
        'AI-powered productivity app using React and TensorFlow',
        'Blockchain-based voting system with smart contracts',
        'IoT environmental monitoring dashboard'
      ];
    }
  }

  /**
   * Extract skills and technologies from project description
   */
  async extractSkillsFromProject(projectDescription: string): Promise<string[]> {
    const prompt = `
Extract relevant technical skills and technologies from this project description:

${projectDescription}

Please provide a JSON response with the following structure:
{
  "skills": ["array of relevant skills and technologies"]
}

Focus on:
- Programming languages
- Frameworks and libraries
- Tools and platforms
- Domain-specific skills
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.skills || [];
      }
      
      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error extracting skills from project:', error);
      return [];
    }
  }
}

export const geminiService = new GeminiService(); 