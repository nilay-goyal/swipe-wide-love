
import { useState, useRef } from 'react';
import { MapPin, Github, Linkedin, ExternalLink } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface GitHubProject {
  name: string;
  description?: string;
  html_url?: string;
  language?: string;
  stargazers_count?: number;
}

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
  github_projects?: GitHubProject[];
}

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: 'up' | 'down') => void;
}

const ProfileCard = ({ profile, onSwipe }: ProfileCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    if (Math.abs(dragOffset.y) > threshold) {
      if (dragOffset.y < -threshold) {
        onSwipe('up');
      } else if (dragOffset.y > threshold) {
        onSwipe('down');
      }
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === profile.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? profile.photos.length - 1 : prev - 1
    );
  };

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
  };

  return (
    <div className="w-full max-w-4xl mx-auto select-none">
      <div 
        ref={cardRef}
        className="bg-app-slate border border-app-white/20 rounded-3xl shadow-2xl overflow-hidden card-hover cursor-grab active:cursor-grabbing"
        style={cardStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex h-96">
          <div className="w-1/2 relative">
            <img
              src={profile.photos[currentPhotoIndex]}
              alt={`${profile.name} photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 left-4 right-4 flex space-x-1">
              {profile.photos.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              →
            </button>

            {/* Additional photos as circular avatars */}
            <div className="absolute bottom-4 left-4 flex space-x-2">
              {profile.photos.slice(1, 4).map((photo, index) => (
                <Avatar key={index + 1} className="w-12 h-12 border-2 border-white">
                  <AvatarImage src={photo} alt={`${profile.name} ${index + 2}`} />
                  <AvatarFallback>{index + 2}</AvatarFallback>
                </Avatar>
              ))}
            </div>

            {isDragging && (
              <>
                {dragOffset.y < -50 && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl">
                      LIKE ❤️
                    </div>
                  </div>
                )}
                {dragOffset.y > 50 && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl">
                      PASS ✕
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-1/2 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-app-amber">{profile.name}</h2>
                  <p className="text-xl text-app-neutral">{profile.age} years old</p>
                </div>
                <div className="flex items-center text-app-neutral/70">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{profile.distance} km away</span>
                </div>
              </div>

              <p className="text-app-neutral text-lg mb-6 leading-relaxed">{profile.bio}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-app-amber/20 text-app-amber rounded-full text-sm font-medium border border-app-amber/30"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 mb-4">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                    <Github className="w-4 h-4" />
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
                {profile.devpost_url && (
                  <a href={profile.devpost_url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">DevPost</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
              </div>

              {/* GitHub Projects Preview */}
              {profile.github_projects && profile.github_projects.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Projects</h4>
                  <div className="space-y-2">
                    {profile.github_projects.slice(0, 2).map((project: any, index: number) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-800">{project.name}</div>
                        <div className="text-gray-600 text-xs">{project.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-gray-500">
              <p className="text-sm">Swipe up to like ❤️</p>
              <p className="text-sm">Swipe down to pass ✕</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
