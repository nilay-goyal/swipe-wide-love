
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
  console.log('Starting social profile scraping with URLs:', urls);
  
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
      updated_at: repo.updated_at
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
    let username = '';
    if (devpostUrl.includes('devpost.com/')) {
      const urlParts = devpostUrl.split('devpost.com/')[1];
      if (urlParts) {
        username = urlParts.split('/')[0];
      }
    }
    
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
