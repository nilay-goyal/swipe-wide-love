
import { useState } from 'react';
import { Heart, X, Star, MapPin } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  distance: number;
  photos: string[];
  interests: string[];
}

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
}

const ProfileCard = ({ profile, onSwipe }: ProfileCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSwipe = (direction: 'left' | 'right') => {
    setIsAnimating(true);
    setTimeout(() => {
      onSwipe(direction);
      setIsAnimating(false);
    }, 300);
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

  return (
    <div className={`w-full max-w-4xl mx-auto ${isAnimating ? 'pointer-events-none' : ''}`}>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden card-hover">
        <div className="flex h-96">
          {/* Photo Section */}
          <div className="w-1/2 relative">
            <img
              src={profile.photos[currentPhotoIndex]}
              alt={`${profile.name} photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Photo Navigation */}
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
            
            {/* Photo Navigation Buttons */}
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
          </div>

          {/* Info Section */}
          <div className="w-1/2 p-8 flex flex-col justify-between">
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

              {/* Interests */}
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors group"
              >
                <X className="w-8 h-8 text-gray-600 group-hover:text-gray-800" />
              </button>
              
              <button className="w-16 h-16 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors group">
                <Star className="w-8 h-8 text-blue-600 group-hover:text-blue-800" />
              </button>
              
              <button
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 dating-gradient hover:opacity-90 rounded-full flex items-center justify-center transition-opacity group"
              >
                <Heart className="w-8 h-8 text-white pulse-heart" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
