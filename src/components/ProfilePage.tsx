
import { useState, useEffect } from 'react';
import { MapPin, Briefcase, GraduationCap, Code, Edit3, Save, X, Plus, ExternalLink, Github, Linkedin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [newWorkExperience, setNewWorkExperience] = useState<WorkExperience>({
    id: Date.now(),
    title: '',
    company: '',
    duration: '',
    description: '',
  });
  const [newEducation, setNewEducation] = useState<Education>({
    id: Date.now(),
    school: '',
    degree: '',
    year: '',
  });
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [devpostUrl, setDevpostUrl] = useState('');
  const [importingGitHub, setImportingGitHub] = useState(false);
  const [importingLinkedIn, setImportingLinkedIn] = useState(false);
  const [importingDevpost, setImportingDevpost] = useState(false);

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
          } else {
            setProfileData(data || {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
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
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          devpost_url: devpostUrl,
          work_experience: profileData.work_experience,
          education_details: profileData.education_details,
          github_projects: profileData.github_projects,
          devpost_projects: profileData.devpost_projects,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

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

  const handleAddWorkExperience = () => {
    if (!newWorkExperience.title || !newWorkExperience.company) {
      toast({
        title: "Error",
        description: "Please fill in title and company fields.",
        variant: "destructive",
      });
      return;
    }

    setProfileData(prev => ({
      ...prev,
      work_experience: [...(prev.work_experience || []), newWorkExperience],
    }));
    setNewWorkExperience({
      id: Date.now(),
      title: '',
      company: '',
      duration: '',
      description: '',
    });
  };

  const handleAddEducation = () => {
    if (!newEducation.school || !newEducation.degree) {
      toast({
        title: "Error",
        description: "Please fill in school and degree fields.",
        variant: "destructive",
      });
      return;
    }

    setProfileData(prev => ({
      ...prev,
      education_details: [...(prev.education_details || []), newEducation],
    }));
    setNewEducation({
      id: Date.now(),
      school: '',
      degree: '',
      year: '',
    });
  };

  const handleRemoveWorkExperience = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      work_experience: prev.work_experience?.filter(item => item.id !== id) || [],
    }));
  };

  const handleRemoveEducation = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      education_details: prev.education_details?.filter(item => item.id !== id) || [],
    }));
  };

  const importFromLinkedIn = async () => {
    if (!linkedinUrl) {
      toast({
        title: "Error",
        description: "Please enter your LinkedIn profile URL first",
        variant: "destructive",
      });
      return;
    }

    setImportingLinkedIn(true);
    try {
      // Since LinkedIn blocks scraping, we'll create a placeholder entry that encourages manual update
      const linkedInEntry: WorkExperience = {
        id: Date.now(),
        title: 'Update from LinkedIn',
        company: 'Please update manually',
        duration: 'Current',
        description: `LinkedIn profile: ${linkedinUrl}. Please update this entry with your actual work experience from LinkedIn.`,
        isImported: true
      };

      setProfileData(prev => ({
        ...prev,
        work_experience: [...(prev.work_experience || []), linkedInEntry]
      }));

      toast({
        title: "LinkedIn Import Note",
        description: "Added placeholder entry. Please update manually as LinkedIn blocks automated data extraction.",
      });

    } catch (error) {
      console.error('LinkedIn import error:', error);
      toast({
        title: "LinkedIn Import Failed",
        description: "LinkedIn blocks automated scraping. Please add your experience manually.",
        variant: "destructive",
      });
    } finally {
      setImportingLinkedIn(false);
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

      // Extract relevant information from GitHub repositories
      const githubProjects = repos.slice(0, 10).map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description || 'No description available',
        url: repo.html_url,
        language: repo.language || 'Unknown',
      }));

      // Update profile data with GitHub projects
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

  const importFromDevpost = async () => {
    if (!devpostUrl) {
      toast({
        title: "Error",
        description: "Please enter your Devpost profile URL first",
        variant: "destructive",
      });
      return;
    }

    setImportingDevpost(true);
    try {
      // Create a placeholder entry for Devpost since direct scraping is difficult
      const devpostProject: DevpostProject = {
        id: Date.now(),
        title: 'Devpost Projects',
        description: `Please visit ${devpostUrl} to see projects. Update this entry manually with your Devpost projects.`,
        url: devpostUrl,
      };

      setProfileData(prev => ({
        ...prev,
        devpost_projects: [...(prev.devpost_projects || []), devpostProject],
      }));

      toast({
        title: "Devpost Import Note",
        description: "Added placeholder entry. Please update manually with your actual projects.",
      });
    } catch (error) {
      console.error('Devpost import error:', error);
      toast({
        title: "Devpost Import Failed",
        description: "Failed to import Devpost projects. Please add your projects manually.",
        variant: "destructive",
      });
    } finally {
      setImportingDevpost(false);
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Profile</h1>
        {isEditing && (
          <button
            onClick={handleSaveProfile}
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <Save className="w-4 h-4 mr-2 inline-block" />
            Save All Changes
          </button>
        )}
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
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
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
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
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
                value={devpostUrl}
                onChange={(e) => setDevpostUrl(e.target.value)}
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

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Work Experience</h2>
            {profileData.work_experience?.map(item => (
              <div key={item.id} className="border rounded p-2 mb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm">{item.company} - {item.duration}</p>
                    <p className="text-gray-600">{item.description}</p>
                    {item.isImported && <span className="text-xs text-blue-500">Imported</span>}
                  </div>
                  {!item.isImported && (
                    <button
                      onClick={() => handleRemoveWorkExperience(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="border rounded p-2">
              <input
                type="text"
                placeholder="Title"
                value={newWorkExperience.title}
                onChange={(e) => setNewWorkExperience({ ...newWorkExperience, title: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <input
                type="text"
                placeholder="Company"
                value={newWorkExperience.company}
                onChange={(e) => setNewWorkExperience({ ...newWorkExperience, company: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <input
                type="text"
                placeholder="Duration"
                value={newWorkExperience.duration}
                onChange={(e) => setNewWorkExperience({ ...newWorkExperience, duration: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <textarea
                placeholder="Description"
                value={newWorkExperience.description}
                onChange={(e) => setNewWorkExperience({ ...newWorkExperience, description: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <button
                onClick={handleAddWorkExperience}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                <Plus className="w-4 h-4 mr-2 inline-block" />
                Add Work Experience
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Education</h2>
            {profileData.education_details?.map(item => (
              <div key={item.id} className="border rounded p-2 mb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.school}</h3>
                    <p className="text-sm">{item.degree} - {item.year}</p>
                    {item.isImported && <span className="text-xs text-blue-500">Imported</span>}
                  </div>
                  {!item.isImported && (
                    <button
                      onClick={() => handleRemoveEducation(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="border rounded p-2">
              <input
                type="text"
                placeholder="School"
                value={newEducation.school}
                onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <input
                type="text"
                placeholder="Degree"
                value={newEducation.degree}
                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <input
                type="text"
                placeholder="Year"
                value={newEducation.year}
                onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <button
                onClick={handleAddEducation}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                <Plus className="w-4 h-4 mr-2 inline-block" />
                Add Education
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">GitHub Projects</h2>
            {profileData.github_projects?.map(project => (
              <div key={project.id} className="border rounded p-2 mb-2">
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-sm text-gray-600">{project.description}</p>
                <p className="text-xs text-blue-500">Language: {project.language}</p>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm">
                  <ExternalLink className="w-3 h-3 mr-1 inline-block" />
                  View on GitHub
                </a>
              </div>
            ))}
            {(!profileData.github_projects || profileData.github_projects.length === 0) && (
              <p className="text-gray-500">No GitHub projects imported. Add your GitHub URL and click Import.</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Devpost Projects</h2>
            {profileData.devpost_projects?.map(project => (
              <div key={project.id} className="border rounded p-2 mb-2">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.description}</p>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm">
                  <ExternalLink className="w-3 h-3 mr-1 inline-block" />
                  View on Devpost
                </a>
              </div>
            ))}
            {(!profileData.devpost_projects || profileData.devpost_projects.length === 0) && (
              <p className="text-gray-500">No Devpost projects imported. Add your Devpost URL and click Import.</p>
            )}
          </div>

          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <X className="w-4 h-4 mr-2 inline-block" />
            Cancel
          </button>
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
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <Github className="w-4 h-4 mr-1 inline-block" />
                {githubUrl}
              </a>
            ) : (
              <p>Not specified</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">LinkedIn</h2>
            {linkedinUrl ? (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <Linkedin className="w-4 h-4 mr-1 inline-block" />
                {linkedinUrl}
              </a>
            ) : (
              <p>Not specified</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Devpost</h2>
            {devpostUrl ? (
              <a href={devpostUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <Code className="w-4 h-4 mr-1 inline-block" />
                {devpostUrl}
              </a>
            ) : (
              <p>Not specified</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Work Experience</h2>
            {profileData.work_experience?.length ? (
              profileData.work_experience.map(item => (
                <div key={item.id} className="border rounded p-2 mb-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm">{item.company} - {item.duration}</p>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))
            ) : (
              <p>No work experience added.</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Education Details</h2>
            {profileData.education_details?.length ? (
              profileData.education_details.map(item => (
                <div key={item.id} className="border rounded p-2 mb-2">
                  <h3 className="font-semibold">{item.school}</h3>
                  <p className="text-sm">{item.degree} - {item.year}</p>
                </div>
              ))
            ) : (
              <p>No education details added.</p>
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
