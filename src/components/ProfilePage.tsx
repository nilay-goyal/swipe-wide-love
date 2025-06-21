
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import { MapPin, Briefcase, GraduationCap, Github, Linkedin, Code, Edit3, Save, X, ExternalLink } from 'lucide-react';

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
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

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
          github_url: profileData.github_url,
          linkedin_url: profileData.linkedin_url,
          devpost_url: profileData.devpost_url,
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
    if (!profileData.github_url) {
      toast({
        title: "Error",
        description: "Please enter your GitHub profile URL first",
        variant: "destructive",
      });
      return;
    }

    setImportingGitHub(true);
    try {
      const username = profileData.github_url.split('/').pop();
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
        <div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name || ''}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">
              Bio:
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio || ''}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
              Location:
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={profileData.location || ''}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="occupation" className="block text-gray-700 text-sm font-bold mb-2">
              Occupation:
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={profileData.occupation || ''}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="education" className="block text-gray-700 text-sm font-bold mb-2">
              Education:
            </label>
            <input
              type="text"
              id="education"
              name="education"
              value={profileData.education || ''}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="github_url" className="block text-gray-700 text-sm font-bold mb-2">
              GitHub URL:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="github_url"
                name="github_url"
                value={profileData.github_url || ''}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                onClick={importFromGitHub}
                disabled={importingGitHub}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {importingGitHub ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="linkedin_url" className="block text-gray-700 text-sm font-bold mb-2">
              LinkedIn URL:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="linkedin_url"
                name="linkedin_url"
                value={profileData.linkedin_url || ''}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                onClick={importFromLinkedIn}
                disabled={importingLinkedIn}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {importingLinkedIn ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="devpost_url" className="block text-gray-700 text-sm font-bold mb-2">
              Devpost URL:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="devpost_url"
                name="devpost_url"
                value={profileData.devpost_url || ''}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <button
                onClick={importFromDevpost}
                disabled={importingDevpost}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {importingDevpost ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSaveProfile}
              className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              <Save className="w-4 h-4 mr-2 inline-block" />
              Save All Changes
            </button>
            
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              <X className="w-4 h-4 mr-2 inline-block" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Name</h2>
            <p>{profileData.name || 'Not specified'}</p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Bio</h2>
            <p>{profileData.bio || 'Not specified'}</p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Location</h2>
            <p>
              <MapPin className="w-4 h-4 mr-1 inline-block" />
              {profileData.location || 'Not specified'}
            </p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Occupation</h2>
            <p>
              <Briefcase className="w-4 h-4 mr-1 inline-block" />
              {profileData.occupation || 'Not specified'}
            </p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Education</h2>
            <p>
              <GraduationCap className="w-4 h-4 mr-1 inline-block" />
              {profileData.education || 'Not specified'}
            </p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">GitHub</h2>
            {profileData.github_url ? (
              <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <Github className="w-4 h-4 mr-1 inline-block" />
                {profileData.github_url}
              </a>
            ) : (
              <p>Not specified</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">LinkedIn</h2>
            {profileData.linkedin_url ? (
              <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <Linkedin className="w-4 h-4 mr-1 inline-block" />
                {profileData.linkedin_url}
              </a>
            ) : (
              <p>Not specified</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Devpost</h2>
            {profileData.devpost_url ? (
              <a href={profileData.devpost_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <Code className="w-4 h-4 mr-1 inline-block" />
                {profileData.devpost_url}
              </a>
            ) : (
              <p>Not specified</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">GitHub Projects</h2>
            {profileData.github_projects?.length ? (
              profileData.github_projects.map(project => (
                <div key={project.id} className="border rounded p-2 mb-2">
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <p className="text-xs text-blue-500">Language: {project.language}</p>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm">
                    <ExternalLink className="w-3 h-3 mr-1 inline-block" />
                    View on GitHub
                  </a>
                </div>
              ))
            ) : (
              <p>No GitHub projects imported.</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Devpost Projects</h2>
            {profileData.devpost_projects?.length ? (
              profileData.devpost_projects.map(project => (
                <div key={project.id} className="border rounded p-2 mb-2">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm">
                    <ExternalLink className="w-3 h-3 mr-1 inline-block" />
                    View on Devpost
                  </a>
                </div>
              ))
            ) : (
              <p>No Devpost projects imported.</p>
            )}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <Edit3 className="w-4 h-4 mr-2 inline-block" />
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
