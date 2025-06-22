import { geminiService, ProjectMatchAnalysis, HackathonGoalMatch } from './geminiService';

export interface User {
  id: string;
  name: string | null;
  age: number | null;
  bio: string | null;
  location: string | null;
  photos: string[] | null;
  interests: string[] | null;
  occupation: string | null;
  education: string | null;
  github_url: string | null;
  devpost_url: string | null;
  linkedin_url: string | null;
  github_projects: any[];
  work_experience: any[];
  education_details: any[];
  linkedin: string | null;
  github: string | null;
  devpost: string | null;
  major: string | null;
  school: string | null;
  year: string | null;
  uiux: number | null;
  pitching: number | null;
  management: number | null;
  hardware: number | null;
  cyber: number | null;
  frontend: number | null;
  backend: number | null;
  skills: string[] | null;
  project_ideas?: string | null;
  hackathon_goals?: string[] | null;
  preferred_team_size?: number | null;
  availability_hours?: number | null;
}

export interface EnhancedMatch {
  match: User;
  score: number;
  breakdown: {
    skillSimilarity: number;
    fieldSimilarity: number;
    projectCompatibility: number;
    goalCompatibility: number;
    teamVibeMatch: number;
  };
  analysis?: {
    projectAnalysis?: ProjectMatchAnalysis;
    goalAnalysis?: HackathonGoalMatch;
  };
}

export interface MatchingFilters {
  projectIdeas?: string;
  hackathonGoals?: string[];
  minSkillMatch?: number;
  maxTeamSize?: number;
  minAvailability?: number;
  preferredSkills?: string[];
}

export async function computeEnhancedMatchesForUser(
  currentUser: User,
  others: User[],
  filters: MatchingFilters = {}
): Promise<EnhancedMatch[]> {
  const allUsers = [currentUser, ...others];
  const skillDocs = allUsers.map((u) => u.skills?.join(', ') || '');

  // TF-IDF similarity calculation (original algorithm)
  const vocab = new Set<string>();
  const tokenized = skillDocs.map((doc) =>
    doc.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  );
  tokenized.forEach((tokens) => tokens.forEach((token) => vocab.add(token)));
  const vocabList = Array.from(vocab);

  const tfVectors = tokenized.map((tokens) => {
    const vec = Array(vocabList.length).fill(0);
    tokens.forEach((token) => {
      const idx = vocabList.indexOf(token);
      if (idx >= 0) vec[idx] += 1;
    });
    return vec;
  });

  const currentVec = tfVectors[0];

  const similarity = (a: number[], b: number[]): number => {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return normA && normB ? dot / (normA * normB) : 0;
  };

  const fieldScore = (a: User, b: User): number => {
    let score = 0;
    const fields: (keyof User)[] = [
      'school', 'year', 'major',
      'uiux', 'pitching', 'management',
      'hardware', 'cyber', 'frontend', 'backend'
    ];

    for (const field of fields) {
      if (a[field] !== undefined && a[field] === b[field]) {
        score += 1;
      }
    }
    return score / fields.length;
  };

  // Enhanced matching with AI analysis
  const enhancedMatches: EnhancedMatch[] = [];

  for (let i = 0; i < others.length; i++) {
    const otherUser = others[i];
    
    // Apply filters
    if (filters.maxTeamSize && otherUser.preferred_team_size && otherUser.preferred_team_size > filters.maxTeamSize) {
      continue;
    }
    
    if (filters.minAvailability && otherUser.availability_hours && otherUser.availability_hours < filters.minAvailability) {
      continue;
    }

    // Calculate base scores
    const skillSim = similarity(currentVec, tfVectors[i + 1]);
    const fieldSim = fieldScore(currentUser, otherUser);

    let projectCompatibility = 0.5; // Default neutral score
    let goalCompatibility = 0.5;
    let teamVibeMatch = 0.5;

    let projectAnalysis: ProjectMatchAnalysis | undefined;
    let goalAnalysis: HackathonGoalMatch | undefined;

    // AI-powered project compatibility analysis
    if (currentUser.project_ideas && otherUser.project_ideas) {
      try {
        projectAnalysis = await geminiService.analyzeProjectCompatibility(
          currentUser.project_ideas,
          otherUser.project_ideas,
          currentUser.skills || [],
          otherUser.skills || []
        );
        projectCompatibility = projectAnalysis.compatibilityScore;
      } catch (error) {
        console.error('Error analyzing project compatibility:', error);
      }
    }

    // AI-powered hackathon goal compatibility analysis
    if (currentUser.hackathon_goals && otherUser.hackathon_goals) {
      try {
        goalAnalysis = await geminiService.analyzeHackathonGoals(
          currentUser.hackathon_goals,
          otherUser.hackathon_goals,
          currentUser.skills || [],
          otherUser.skills || []
        );
        goalCompatibility = goalAnalysis.goalCompatibility;
        teamVibeMatch = goalAnalysis.teamVibeMatch;
      } catch (error) {
        console.error('Error analyzing hackathon goals:', error);
      }
    }

    // Apply project ideas filter
    if (filters.projectIdeas && currentUser.project_ideas) {
      const projectMatch = await geminiService.analyzeProjectCompatibility(
        filters.projectIdeas,
        currentUser.project_ideas,
        currentUser.skills || [],
        otherUser.skills || []
      );
      projectCompatibility = projectMatch.compatibilityScore;
    }

    // Apply hackathon goals filter
    if (filters.hackathonGoals && currentUser.hackathon_goals) {
      const goalMatch = await geminiService.analyzeHackathonGoals(
        filters.hackathonGoals,
        currentUser.hackathon_goals,
        currentUser.skills || [],
        otherUser.skills || []
      );
      goalCompatibility = goalMatch.goalCompatibility;
      teamVibeMatch = goalMatch.teamVibeMatch;
    }

    // Calculate weighted combined score
    const weights = {
      skillSimilarity: 0.25,
      fieldSimilarity: 0.20,
      projectCompatibility: 0.25,
      goalCompatibility: 0.20,
      teamVibeMatch: 0.10
    };

    const combinedScore = 
      weights.skillSimilarity * skillSim +
      weights.fieldSimilarity * fieldSim +
      weights.projectCompatibility * projectCompatibility +
      weights.goalCompatibility * goalCompatibility +
      weights.teamVibeMatch * teamVibeMatch;

    enhancedMatches.push({
      match: otherUser,
      score: combinedScore,
      breakdown: {
        skillSimilarity: skillSim,
        fieldSimilarity: fieldSim,
        projectCompatibility,
        goalCompatibility,
        teamVibeMatch
      },
      analysis: {
        projectAnalysis,
        goalAnalysis
      }
    });
  }

  // Sort by score and return
  return enhancedMatches.sort((a, b) => b.score - a.score);
}

// Helper function to get hackathon goal options
export const HACKATHON_GOALS = [
  'Win the competition',
  'Learn new technologies',
  'Network with other developers',
  'Build a portfolio project',
  'Have fun and be creative',
  'Solve a real-world problem',
  'Get mentorship and feedback',
  'Explore entrepreneurship',
  'Improve technical skills',
  'Make new friends'
] as const;

export type HackathonGoal = typeof HACKATHON_GOALS[number];

// Helper function to validate and normalize hackathon goals
export function normalizeHackathonGoals(goals: string[]): string[] {
  return goals.filter(goal => HACKATHON_GOALS.includes(goal as HackathonGoal));
} 