import { useState, useRef } from 'react';
import { MapPin, Github, Linkedin, ExternalLink } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface DiscoverProfile {
  id: string;
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
  profile: DiscoverProfile;
  onSwipe: (direction: 'up' | 'down') => void;
}

const ProfileDisplay = ({ profile, onSwipe }: ProfileDisplayProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
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

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isDragging && Math.abs(dragOffset.x) < 10 && Math.abs(dragOffset.y) < 10) {
      setIsFlipped(!isFlipped);
    }
  };

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    transformStyle: 'preserve-3d' as const,
  };

  return (
    <div className="w-full max-w-4xl mx-auto select-none">
      <div 
        ref={cardRef}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden card-hover cursor-grab active:cursor-grabbing relative"
        style={cardStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        {/* Front of card */}
        <div className={`${isFlipped ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} style={{ backfaceVisibility: 'hidden' }}>
          <div className="flex h-96">
            {/* Profile photo - circular and 1/4 of card */}
            <div className="w-1/4 p-8 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                <img
                  src={profile.photos[0]}
                  alt={`${profile.name}`}
                  className="w-full h-full object-cover"
                />
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

            {/* Profile details - 3/4 of card */}
            <div className="w-3/4 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
                    <p className="text-xl text-gray-600">{profile.age} years old</p>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{profile.distance} km away</span>
                  </div>
                </div>

                <p className="text-gray-700 text-lg mb-6 leading-relaxed">{profile.bio}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                {/* GitHub Projects Preview */}
                {profile.github_projects && profile.github_projects.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Recent Projects</h3>
                    <div className="space-y-2">
                      {profile.github_projects.slice(0, 2).map((project: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-800 text-sm">{project.name}</h4>
                            <span className="text-xs text-gray-500 flex items-center">
                              ⭐ {project.stars}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mb-1">{project.description}</p>
                          <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {project.language}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-gray-500">
                <p className="text-sm">Swipe up to like ❤️</p>
                <p className="text-sm">Swipe down to pass ✕</p>
                <p className="text-sm">Click to flip card 🔄</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className={`absolute inset-0 ${isFlipped ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 bg-white rounded-3xl p-8`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}'s Details</h2>
              <button 
                onClick={() => setIsFlipped(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>

            <div className="flex-1 space-y-6">
              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Connect</h3>
                <div className="flex space-x-4">
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                      <Github className="w-5 h-5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile.devpost_url && (
                    <a href={profile.devpost_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                      <ExternalLink className="w-5 h-5" />
                      <span>DevPost</span>
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                      <Linkedin className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>

              {/* GitHub Projects */}
              {profile.github_projects && profile.github_projects.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Recent Projects</h3>
                  <div className="space-y-4">
                    {profile.github_projects.map((project: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{project.name}</h4>
                          <span className="text-sm text-gray-500 flex items-center">
                            ⭐ {project.stars}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                        <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {project.language}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extended Bio */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplay;
