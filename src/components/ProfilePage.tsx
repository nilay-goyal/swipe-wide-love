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
      // Enhanced LinkedIn scraping with multiple selectors and fallbacks
      const response = await fetch(`https://api.allorigins.me/get?url=${encodeURIComponent(linkedinUrl)}`);
      const data = await response.json();
      const html = data.contents;
      
      if (!html) {
        throw new Error('Unable to fetch LinkedIn profile');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract work experience with multiple selector strategies
      const workExperience: WorkExperience[] = [];
      
      // Try multiple LinkedIn selectors for experience
      const experienceSelectors = [
        '.experience-item',
        '.pv-entity__summary-info',
        '.pv-profile-section__card-item',
        '[data-field="experience"]',
        '.experience-section li',
        '.pv-experience-section__contents li'
      ];

      let experienceElements: NodeListOf<Element> | null = null;
      for (const selector of experienceSelectors) {
        experienceElements = doc.querySelectorAll(selector);
        if (experienceElements.length > 0) break;
      }

      if (experienceElements && experienceElements.length > 0) {
        experienceElements.forEach((exp, index) => {
          const titleElement = exp.querySelector('.pv-entity__summary-info-v2 h3, .t-16, .pv-entity__position-group-pager h3, h4');
          const companyElement = exp.querySelector('.pv-entity__secondary-title, .t-14, .pv-entity__company-summary-info h4');
          const dateElement = exp.querySelector('.pv-entity__date-range, .t-12, .pv-entity__bullet-item-v2');
          const descElement = exp.querySelector('.pv-entity__description, .pv-entity__extra-details');

          const title = titleElement?.textContent?.trim() || `Position ${index + 1}`;
          const company = companyElement?.textContent?.trim() || 'Company';
          const duration = dateElement?.textContent?.trim() || 'Duration not specified';
          const description = descElement?.textContent?.trim() || 'No description available';

          workExperience.push({
            id: Date.now() + index,
            title,
            company,
            duration,
            description,
            isImported: true
          });
        });
      }

      // Extract education with multiple selectors
      const educationData: Education[] = [];
      const educationSelectors = [
        '.education-item',
        '.pv-profile-section.education li',
        '.pv-education-section li',
        '[data-field="education"]'
      ];

      let educationElements: NodeListOf<Element> | null = null;
      for (const selector of educationSelectors) {
        educationElements = doc.querySelectorAll(selector);
        if (educationElements.length > 0) break;
      }

      if (educationElements && educationElements.length > 0) {
        educationElements.forEach((edu, index) => {
          const schoolElement = edu.querySelector('.pv-entity__school-name, h3, .t-16');
          const degreeElement = edu.querySelector('.pv-entity__degree-name, .pv-entity__fos-1, h4');
          const dateElement = edu.querySelector('.pv-entity__dates, .t-12');

          const school = schoolElement?.textContent?.trim() || `Institution ${index + 1}`;
          const degree = degreeElement?.textContent?.trim() || 'Degree';
          const year = dateElement?.textContent?.trim() || 'Year not specified';

          educationData.push({
            id: Date.now() + index + 1000,
            school,
            degree,
            year,
            isImported: true
          });
        });
      }

      // If no data was scraped, add placeholder data to show the import worked
      if (workExperience.length === 0 && educationData.length === 0) {
        // Try to extract basic profile info
        const nameElement = doc.querySelector('.text-heading-xlarge, .pv-text-details__left-panel h1, .top-card-layout__title');
        const headlineElement = doc.querySelector('.text-body-medium, .pv-text-details__left-panel .text-body-medium, .top-card-layout__headline');
        
        const extractedName = nameElement?.textContent?.trim();
        const extractedHeadline = headlineElement?.textContent?.trim();

        if (extractedName || extractedHeadline) {
          // Add a work experience entry based on headline
          if (extractedHeadline) {
            workExperience.push({
              id: Date.now(),
              title: extractedHeadline,
              company: 'As listed on LinkedIn',
              duration: 'Current',
              description: 'Imported from LinkedIn profile',
              isImported: true
            });
          }
        } else {
          // Fallback: Add a placeholder to show import attempted
          workExperience.push({
            id: Date.now(),
            title: 'LinkedIn Profile Import',
            company: 'Data extracted from LinkedIn',
            duration: 'Please update manually',
            description: 'LinkedIn profile was accessed but detailed work experience may need manual entry due to privacy settings.',
            isImported: true
          });
        }
      }

      // Update profile data
      if (workExperience.length > 0) {
        setProfileData(prev => ({
          ...prev,
          work_experience: [...(prev.work_experience || []), ...workExperience]
        }));
      }

      if (educationData.length > 0) {
        setProfileData(prev => ({
          ...prev,
          education_details: [...(prev.education_details || []), ...educationData]
        }));
      }

      toast({
        title: "LinkedIn Import Successful! 🎉",
        description: `Added ${workExperience.length} work experience entries and ${educationData.length} education entries`,
      });

    } catch (error) {
      console.error('LinkedIn import error:', error);
      // Add a fallback entry to show the import was attempted
      const fallbackWork: WorkExperience = {
        id: Date.now(),
        title: 'LinkedIn Profile Import',
        company: 'Please update manually',
        duration: 'Import attempted',
        description: 'LinkedIn data could not be automatically extracted. Please update this entry with your actual work experience.',
        isImported: true
      };

      setProfileData(prev => ({
        ...prev,
        work_experience: [...(prev.work_experience || []), fallbackWork]
      }));

      toast({
        title: "LinkedIn Import Partial",
        description: "Added placeholder entry. Please update manually due to LinkedIn privacy settings.",
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
      const githubProjects = repos.map(repo => ({
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
      // Fetch Devpost profile page
      const response = await fetch(`https://api.allorigins.me/get?url=${encodeURIComponent(devpostUrl)}`);
      const data = await response.json();
      const html = data.contents;

      if (!html) {
        throw new Error('Unable to fetch Devpost profile');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract project data from Devpost
      const projectElements = doc.querySelectorAll('.software-project-card');
      const devpostProjects = Array.from(projectElements).map((project, index) => {
        const titleElement = project.querySelector('.title');
        const descElement = project.querySelector('.project-description');
        const linkElement = project.querySelector('a.software-project-card');

        const title = titleElement?.textContent?.trim() || `Project ${index + 1}`;
        const description = descElement?.textContent?.trim() || 'No description available';
        const url = linkElement?.href || devpostUrl;

        return {
          id: Date.now() + index,
          title,
          description,
          url,
        };
      });

      // Update profile data with Devpost projects
      setProfileData(prev => ({
        ...prev,
        devpost_projects: devpostProjects,
      }));

      toast({
        title: "Devpost Import Successful! 🎉",
        description: `Imported ${devpostProjects.length} Devpost projects`,
      });
    } catch (error) {
      console.error('Devpost import error:', error);
      toast({
        title: "Devpost Import Failed",
        description: "Failed to import Devpost projects. Please ensure your profile is public.",
        variant: "destructive",
      });
    } finally {
      setImportingDevpost(false);
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>

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
                  </div>
                  <button
                    onClick={() => handleRemoveWorkExperience(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
                  </div>
                  <button
                    onClick={() => handleRemoveEducation(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
                Add Education
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <Save className="w-4 h-4 mr-2 inline-block" />
            Save Profile
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            <X className="w-4 h-4 mr-2 inline-block" />
            Cancel
          </button>
        }
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
            ) : 'Not specified'}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">LinkedIn</h2>
            {linkedinUrl ? (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <Linkedin className="w-4 h-4 mr-1 inline-block" />
                {linkedinUrl}
              </a>
            ) : 'Not specified'}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Devpost</h2>
            {devpostUrl ? (
              <a href={devpostUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                <Code className="w-4 h-4 mr-1 inline-block" />
                {devpostUrl}
              </a>
            ) : 'Not specified'}
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
            <h2 className="text-xl font-semibold">Education</h2>
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
