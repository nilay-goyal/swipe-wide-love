
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import ProfileDisplay from './profile/ProfileDisplay';
import ProfileEdit from './profile/ProfileEdit';

interface ProfileData {
  id?: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  education: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  devpost_url: string | null;
  work_experience: WorkExperience[] | null;
  education_details: Education[] | null;
  github_projects: GitHubProject[] | null;
  devpost_projects: DevpostProject[] | null;
}

interface WorkExperience {
  id: number;
  title: string;
  company: string;
  duration: string;
  description: string;
  isImported?: boolean;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  year: string;
  isImported?: boolean;
}

interface GitHubProject {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
}

interface DevpostProject {
  id: number;
  title: string;
  description: string;
  url: string;
}

interface ProfilePageProps {
  onEditRequireAuth: () => void;
}

const ProfilePage = ({ onEditRequireAuth }: ProfilePageProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileData>({
    name: null,
    bio: null,
    location: null,
    occupation: null,
    education: null,
    github_url: null,
    linkedin_url: null,
    devpost_url: null,
    work_experience: null,
    education_details: null,
    github_projects: null,
    devpost_projects: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [devpostUrl, setDevpostUrl] = useState('');
  const [importingGitHub, setImportingGitHub] = useState(false);
  const [importingLinkedIn, setImportingLinkedIn] = useState(false);
  const [importingDevpost, setImportingDevpost] = useState(false);

  // Helper function to safely parse JSON data
  const parseJsonField = (jsonData: Json | null): any[] => {
    if (!jsonData) return [];
    if (Array.isArray(jsonData)) return jsonData;
    if (typeof jsonData === 'string') {
      try {
        const parsed = JSON.parse(jsonData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            const processedData: ProfileData = {
              ...data,
              work_experience: parseJsonField(data.work_experience),
              education_details: parseJsonField(data.education_details),
              github_projects: parseJsonField(data.github_projects),
              devpost_projects: parseJsonField(data.devpost_projects),
            };
            
            setProfileData(processedData);
            setGithubUrl(data?.github_url || '');
            setLinkedinUrl(data?.linkedin_url || '');
            setDevpostUrl(data?.devpost_url || '');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) {
      onEditRequireAuth();
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          occupation: profileData.occupation,
          education: profileData.education,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          devpost_url: devpostUrl,
          work_experience: profileData.work_experience,
          education_details: profileData.education_details,
          github_projects: profileData.github_projects,
          devpost_projects: profileData.devpost_projects,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile Updated! 🎉",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importFromGitHub = async () => {
    if (!githubUrl) {
      toast({
        title: "Error",
        description: "Please enter your GitHub profile URL first",
        variant: "destructive",
      });
      return;
    }

    setImportingGitHub(true);
    try {
      const username = githubUrl.split('/').pop();
      if (!username) throw new Error('Invalid GitHub URL');

      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      const repos = await response.json();

      if (!Array.isArray(repos)) {
        throw new Error('Could not fetch GitHub repositories');
      }

      const githubProjects = repos.slice(0, 10).map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description || 'No description available',
        url: repo.html_url,
        language: repo.language || 'Unknown',
      }));

      setProfileData(prev => ({
        ...prev,
        github_projects: githubProjects,
      }));

      toast({
        title: "GitHub Import Successful! 🎉",
        description: `Imported ${githubProjects.length} GitHub projects`,
      });
    } catch (error) {
      console.error('GitHub import error:', error);
      toast({
        title: "GitHub Import Failed",
        description: "Failed to import GitHub projects. Please ensure your profile is public.",
        variant: "destructive",
      });
    } finally {
      setImportingGitHub(false);
    }
  };

  const importFromLinkedIn = async () => {
    setImportingLinkedIn(true);
    try {
      toast({
        title: "LinkedIn Import Note",
        description: "LinkedIn blocks automated scraping. Please add your experience manually.",
      });
    } finally {
      setImportingLinkedIn(false);
    }
  };

  const importFromDevpost = async () => {
    setImportingDevpost(true);
    try {
      toast({
        title: "Devpost Import Note",
        description: "Please add your Devpost projects manually.",
      });
    } finally {
      setImportingDevpost(false);
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Profile</h1>
      </div>

      {isEditing ? (
        <ProfileEdit
          profileData={profileData}
          onProfileDataChange={setProfileData}
          githubUrl={githubUrl}
          linkedinUrl={linkedinUrl}
          devpostUrl={devpostUrl}
          onGithubUrlChange={setGithubUrl}
          onLinkedinUrlChange={setLinkedinUrl}
          onDevpostUrlChange={setDevpostUrl}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
          onImportGitHub={importFromGitHub}
          onImportLinkedIn={importFromLinkedIn}
          onImportDevpost={importFromDevpost}
          importingGitHub={importingGitHub}
          importingLinkedIn={importingLinkedIn}
          importingDevpost={importingDevpost}
        />
      ) : (
        <ProfileDisplay
          profileData={profileData}
          githubUrl={githubUrl}
          linkedinUrl={linkedinUrl}
          devpostUrl={devpostUrl}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
