
import { supabase } from '@/integrations/supabase/client';

export interface ScrapedData {
  github_projects?: any[];
  work_experience?: any[];
  education_details?: any[];
  // New fields for hackathon info
  major?: string;
  school?: string;
  year?: string;
}

export const scrapeSocialProfiles = async (urls: {
  github_url?: string;
  linkedin_url?: string;
  devpost_url?: string;
}): Promise<ScrapedData> => {
  console.log('Starting social profile scraping with URLs:', urls);
  
  const scrapedData: ScrapedData = {
    github_projects: [],
    work_experience: [],
    education_details: [],
    major: undefined,
    school: undefined,
    year: undefined
  };

  try {
    // Scrape GitHub repositories
    if (urls.github_url) {
      console.log('Scraping GitHub profile:', urls.github_url);
      const githubData = await scrapeGitHub(urls.github_url);
      console.log('GitHub data received:', githubData);
      if (githubData && githubData.length > 0) {
        scrapedData.github_projects = githubData;
      }
    }

    // Scrape LinkedIn profile
    if (urls.linkedin_url) {
      console.log('Scraping LinkedIn profile:', urls.linkedin_url);
      const linkedinData = await scrapeLinkedIn(urls.linkedin_url);
      console.log('LinkedIn data received:', linkedinData);
      if (linkedinData) {
        scrapedData.work_experience = linkedinData.work_experience || [];
        scrapedData.education_details = linkedinData.education_details || [];
        // Extract education info for hackathon fields
        if (linkedinData.education_details && linkedinData.education_details.length > 0) {
          const latestEducation = linkedinData.education_details[0];
          scrapedData.major = extractMajorFromDegree(latestEducation.degree);
          scrapedData.school = latestEducation.school;
          scrapedData.year = extractYearFromEducation(latestEducation.year);
        }
      }
    }

    // Scrape DevPost profile
    if (urls.devpost_url) {
      console.log('Scraping DevPost profile:', urls.devpost_url);
      const devpostData = await scrapeDevPost(urls.devpost_url);
      console.log('DevPost data received:', devpostData);
      if (devpostData && devpostData.length > 0) {
        scrapedData.github_projects = [...(scrapedData.github_projects || []), ...devpostData];
      }
    }

    console.log('Final scraped data:', scrapedData);
    return scrapedData;
  } catch (error) {
    console.error('Error scraping social profiles:', error);
    throw new Error('Failed to import data from social profiles. Please check your URLs and try again.');
  }
};

const extractMajorFromDegree = (degree: string): string | undefined => {
  if (!degree) return undefined;
  
  const lowerDegree = degree.toLowerCase();
  if (lowerDegree.includes('computer science') || lowerDegree.includes('cs')) {
    return 'Computer Science';
  } else if (lowerDegree.includes('computer engineering')) {
    return 'Computer Engineering';
  } else if (lowerDegree.includes('software engineering')) {
    return 'Software Engineering';
  } else if (lowerDegree.includes('electrical engineering')) {
    return 'Electrical Engineering';
  }
  return 'Other';
};

const extractYearFromEducation = (year: string): string | undefined => {
  if (!year) return undefined;
  
  const currentYear = new Date().getFullYear();
  const yearMatch = year.match(/(\d{4})/);
  
  if (yearMatch) {
    const gradYear = parseInt(yearMatch[1]);
    const yearsSinceGrad = currentYear - gradYear;
    
    if (yearsSinceGrad <= 0) {
      if (yearsSinceGrad >= -4) return `${Math.abs(yearsSinceGrad) + 1}${getOrdinalSuffix(Math.abs(yearsSinceGrad) + 1)} year`;
      return 'Graduate';
    } else if (yearsSinceGrad <= 2) {
      return 'Graduate';
    }
  }
  
  return 'Other';
};

const getOrdinalSuffix = (num: number): string => {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
};

const scrapeGitHub = async (githubUrl: string): Promise<any[]> => {
  try {
    console.log('Processing GitHub URL:', githubUrl);
    
    // Extract username from GitHub URL - handle various URL formats
    let username = '';
    if (githubUrl.includes('github.com/')) {
      const urlParts = githubUrl.split('github.com/')[1];
      if (urlParts) {
        username = urlParts.split('/')[0];
      }
    }
    
    console.log('Extracted GitHub username:', username);
    
    if (!username) {
      console.error('Could not extract username from GitHub URL');
      return [];
    }

    // Use GitHub API to get user repositories
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`;
    console.log('Fetching from GitHub API:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('GitHub API response status:', response.status);
    
    if (!response.ok) {
      console.error('GitHub API request failed:', response.status, response.statusText);
      return [];
    }

    const repos = await response.json();
    console.log('GitHub repos received:', repos.length, 'repositories');
    
    const formattedRepos = repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description || 'No description available',
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
      updated_at: repo.updated_at,
      type: 'github'
    }));
    
    console.log('Formatted GitHub repos:', formattedRepos);
    return formattedRepos;
  } catch (error) {
    console.error('Error scraping GitHub:', error);
    return [];
  }
};

const scrapeLinkedIn = async (linkedinUrl: string): Promise<any> => {
  try {
    // Since LinkedIn blocks direct scraping, we'll use a mock implementation
    // In a real app, you'd use a service like Proxycurl or RapidAPI
    console.log('LinkedIn scraping would require external service for:', linkedinUrl);
    
    // Return mock data structure for now with education info
    return {
      work_experience: [
        {
          title: "Software Engineer Intern",
          company: "Tech Company",
          duration: "Summer 2023",
          description: "Developed web applications and APIs"
        },
        {
          title: "Research Assistant",
          company: "University Lab",
          duration: "2022 - 2023",
          description: "Conducted research in machine learning"
        }
      ],
      education_details: [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "University of Technology",
          year: "2020-2024",
          description: "Relevant coursework: Data Structures, Algorithms, Software Engineering"
        }
      ]
    };
  } catch (error) {
    console.error('Error scraping LinkedIn:', error);
    return null;
  }
};

const scrapeDevPost = async (devpostUrl: string): Promise<any[]> => {
  try {
    // Extract username from DevPost URL
    let username = '';
    if (devpostUrl.includes('devpost.com/')) {
      const urlParts = devpostUrl.split('devpost.com/')[1];
      if (urlParts) {
        username = urlParts.split('/')[0];
      }
    }
    
    console.log('DevPost scraping would require custom implementation for:', devpostUrl);
    
    // Return mock hackathon project data
    return [
      {
        name: "HealthTrack AI",
        description: "AI-powered health monitoring app built at HackMIT 2023",
        language: "Python",
        stars: 15,
        url: devpostUrl,
        updated_at: new Date().toISOString(),
        type: 'hackathon',
        event: 'HackMIT 2023',
        awards: ['Best Use of AI/ML']
      },
      {
        name: "EcoCommute",
        description: "Sustainable transportation app for reducing carbon footprint",
        language: "React Native",
        stars: 8,
        url: devpostUrl,
        updated_at: new Date().toISOString(),
        type: 'hackathon',
        event: 'TreeHacks 2023',
        awards: ['Environmental Impact Award']
      }
    ];
  } catch (error) {
    console.error('Error scraping DevPost:', error);
    return [];
  }
};
