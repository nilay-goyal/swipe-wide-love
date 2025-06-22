
import { supabase } from '@/integrations/supabase/client';

export interface ScrapedData {
  github_projects?: any[];
  work_experience?: any[];
  education_details?: any[];
}

export const scrapeSocialProfiles = async (urls: {
  github_url?: string;
  linkedin_url?: string;
  devpost_url?: string;
}): Promise<ScrapedData> => {
  const scrapedData: ScrapedData = {
    github_projects: [],
    work_experience: [],
    education_details: []
  };

  try {
    // Scrape GitHub repositories
    if (urls.github_url) {
      console.log('Scraping GitHub profile:', urls.github_url);
      const githubData = await scrapeGitHub(urls.github_url);
      if (githubData) {
        scrapedData.github_projects = githubData;
      }
    }

    // Scrape LinkedIn profile
    if (urls.linkedin_url) {
      console.log('Scraping LinkedIn profile:', urls.linkedin_url);
      const linkedinData = await scrapeLinkedIn(urls.linkedin_url);
      if (linkedinData) {
        scrapedData.work_experience = linkedinData.work_experience || [];
        scrapedData.education_details = linkedinData.education_details || [];
      }
    }

    // Scrape DevPost profile
    if (urls.devpost_url) {
      console.log('Scraping DevPost profile:', urls.devpost_url);
      const devpostData = await scrapeDevPost(urls.devpost_url);
      if (devpostData) {
        scrapedData.github_projects = [...(scrapedData.github_projects || []), ...devpostData];
      }
    }

    return scrapedData;
  } catch (error) {
    console.error('Error scraping social profiles:', error);
    return scrapedData;
  }
};

const scrapeGitHub = async (githubUrl: string): Promise<any[]> => {
  try {
    // Extract username from GitHub URL
    const username = githubUrl.split('github.com/')[1]?.split('/')[0];
    if (!username) return [];

    // Use GitHub API to get user repositories
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    if (!response.ok) return [];

    const repos = await response.json();
    return repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description || 'No description available',
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
      updated_at: repo.updated_at
    }));
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
    
    // Return mock data structure for now
    return {
      work_experience: [
        {
          title: "Software Engineer",
          company: "Tech Company",
          duration: "2022 - Present",
          description: "Developing web applications and APIs"
        }
      ],
      education_details: [
        {
          degree: "Computer Science",
          school: "University",
          year: "2018-2022",
          description: "Bachelor's degree in Computer Science"
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
    const username = devpostUrl.split('devpost.com/')[1]?.split('/')[0];
    if (!username) return [];

    console.log('DevPost scraping would require custom implementation for:', devpostUrl);
    
    // Return mock project data for now
    return [
      {
        name: "Hackathon Project",
        description: "Award-winning project from major hackathon",
        language: "JavaScript",
        stars: 25,
        url: devpostUrl,
        updated_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error scraping DevPost:', error);
    return [];
  }
};
