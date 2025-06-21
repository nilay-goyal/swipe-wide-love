
import { Save, X, Plus } from 'lucide-react';

interface ProfileData {
  name: string | null;
  bio: string | null;
  location: string | null;
  occupation: string | null;
  education: string | null;
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

interface ProfileEditProps {
  profileData: ProfileData;
  onProfileDataChange: (data: ProfileData) => void;
  githubUrl: string;
  linkedinUrl: string;
  devpostUrl: string;
  onGithubUrlChange: (url: string) => void;
  onLinkedinUrlChange: (url: string) => void;
  onDevpostUrlChange: (url: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onImportGitHub: () => void;
  onImportLinkedIn: () => void;
  onImportDevpost: () => void;
  importingGitHub: boolean;
  importingLinkedIn: boolean;
  importingDevpost: boolean;
}

const ProfileEdit = ({ 
  profileData, 
  onProfileDataChange,
  githubUrl,
  linkedinUrl,
  devpostUrl,
  onGithubUrlChange,
  onLinkedinUrlChange,
  onDevpostUrlChange,
  onSave, 
  onCancel,
  onImportGitHub,
  onImportLinkedIn,
  onImportDevpost,
  importingGitHub,
  importingLinkedIn,
  importingDevpost
}: ProfileEditProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onProfileDataChange({
      ...profileData,
      [name]: value,
    });
  };

  return (
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
            onChange={(e) => onGithubUrlChange(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={onImportGitHub}
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
            onChange={(e) => onLinkedinUrlChange(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={onImportLinkedIn}
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
            onChange={(e) => onDevpostUrlChange(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={onImportDevpost}
            disabled={importingDevpost}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {importingDevpost ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onSave}
          className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          <Save className="w-4 h-4 mr-2 inline-block" />
          Save All Changes
        </button>
        
        <button
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          <X className="w-4 h-4 mr-2 inline-block" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit;
