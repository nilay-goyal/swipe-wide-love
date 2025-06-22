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
}

export interface MatchResult {
  match: User;
  score: number;
}

export function computeMatchesForUser(
  currentUser: User,
  others: User[]
): MatchResult[] {
  console.log('Computing matches for user:', currentUser.name);
  console.log('Current user skills:', currentUser.skills);
  
  const allUsers = [currentUser, ...others];
  
  // Handle skills properly - convert to string arrays and filter out empty ones
  const skillDocs = allUsers.map((u) => {
    const skills = u.skills || [];
    return Array.isArray(skills) ? skills.join(', ') : '';
  });

  console.log('Skill docs:', skillDocs);

  const vocab = new Set<string>();
  const tokenized = skillDocs.map((doc) =>
    doc.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  );
  
  console.log('Tokenized skills:', tokenized);
  
  tokenized.forEach((tokens) => tokens.forEach((token) => vocab.add(token)));
  const vocabList = Array.from(vocab);
  
  console.log('Vocabulary:', vocabList);

  const tfVectors = tokenized.map((tokens) => {
    const vec = Array(vocabList.length).fill(0);
    tokens.forEach((token) => {
      const idx = vocabList.indexOf(token);
      if (idx >= 0) vec[idx] += 1;
    });
    return vec;
  });

  console.log('TF vectors:', tfVectors);

  const currentVec = tfVectors[0];

  const similarity = (a: number[], b: number[]): number => {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    const result = normA && normB ? dot / (normA * normB) : 0;
    console.log('Similarity calculation:', { dot, normA, normB, result });
    return result;
  };

  const fieldScore = (a: User, b: User): number => {
    let score = 0;
    let totalFields = 0;
    const fields: (keyof User)[] = [
      'school', 'year', 'major',
      'uiux', 'pitching', 'management',
      'hardware', 'cyber', 'frontend', 'backend'
    ];

    for (const field of fields) {
      if (a[field] !== undefined && a[field] !== null && b[field] !== undefined && b[field] !== null) {
        totalFields++;
        if (a[field] === b[field]) {
          score += 1;
        }
      }
    }
    
    const result = totalFields > 0 ? score / totalFields : 0;
    console.log('Field score calculation:', { score, totalFields, result });
    return result;
  };

  const results = others.map((user, idx) => {
    const skillSim = similarity(currentVec, tfVectors[idx + 1]);
    const fieldSim = fieldScore(currentUser, user);
    let combinedScore = 0.5 * skillSim + 0.5 * fieldSim;
    
    // Fallback: if no meaningful data to match on, give a base score
    if (skillSim === 0 && fieldSim === 0) {
      // Give a small random score between 0.1 and 0.3 to ensure some variation
      combinedScore = 0.1 + Math.random() * 0.2;
    }
    
    console.log(`Match for ${user.name}:`, {
      skillSim,
      fieldSim,
      combinedScore
    });
    
    return { match: user, score: combinedScore };
  }).sort((a, b) => b.score - a.score);

  console.log('Final sorted results:', results.map(r => ({ name: r.match.name, score: r.score })));
  return results;
} 