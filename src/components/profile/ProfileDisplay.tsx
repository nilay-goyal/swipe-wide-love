
import { MapPin, Briefcase, GraduationCap, Github, Linkedin, Code, Edit3, ExternalLink } from 'lucide-react';

interface ProfileData {
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
}

interface Education {
  id: number;
  school: string;
  degree: string;
  year: string;
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

interface ProfileDisplayProps {
  profileData: ProfileData;
  githubUrl: string;
  linkedinUrl: string;
  devpostUrl: string;
  onEdit: () => void;
}

const ProfileDisplay = ({ profileData, githubUrl, linkedinUrl, devpostUrl, onEdit }: ProfileDisplayProps) => {
  return (
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
        onClick={onEdit}
        className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        <Edit3 className="w-4 h-4 mr-2 inline-block" />
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileDisplay;
