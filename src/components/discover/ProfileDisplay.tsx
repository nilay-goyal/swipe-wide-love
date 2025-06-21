
import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Github, ExternalLink, Linkedin } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  distance: number;
  photos: string[];
  interests: string[];
  github_url?: string;
  devpost_url?: string;
  linkedin_url?: string;
  github_projects?: any[];
}

interface ProfileDisplayProps {
  profile: Profile;
}

const ProfileDisplay = ({ profile }: ProfileDisplayProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto">
      <div className="relative h-96">
        <img
          src={profile.photos[currentPhotoIndex]}
          alt={`${profile.name} photo ${currentPhotoIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {profile.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {profile.photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold">{profile.name}, {profile.age}</h2>
              <div className="flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{profile.distance} miles away</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-700 mb-4 leading-relaxed">{profile.bio}</p>
        
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 mb-4">
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          )}
          {profile.devpost_url && (
            <a
              href={profile.devpost_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Devpost</span>
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>

        {profile.github_projects && profile.github_projects.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Recent Projects</h3>
            <div className="space-y-2">
              {profile.github_projects.slice(0, 2).map((project, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{project.name}</h4>
                    <span className="text-xs text-gray-500 flex items-center">
                      ⭐ {project.stars}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {project.language}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDisplay;
