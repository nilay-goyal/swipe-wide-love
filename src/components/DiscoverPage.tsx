import { useState, useEffect } from 'react';
import ProfileDisplay from './discover/ProfileDisplay';
import SwipeButtons from './discover/SwipeButtons';
import { useToast } from '@/hooks/use-toast';

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

const DiscoverPage = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sampleProfiles: Profile[] = [
    {
      id: 1,
      name: "Emma",
      age: 26,
      bio: "Adventure seeker, coffee enthusiast, and dog lover. Looking for someone to explore the city with and share meaningful conversations.",
      distance: 3,
      photos: [
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=600&fit=crop&crop=face"
      ],
      interests: ["Travel", "Photography", "Yoga", "Books"],
      github_url: "https://github.com/emma-dev",
      linkedin_url: "https://linkedin.com/in/emma-smith",
      github_projects: [
        {
          name: "travel-planner",
          description: "A React app for planning adventures",
          language: "JavaScript",
          stars: 42
        },
        {
          name: "photo-gallery",
          description: "Beautiful photo showcase platform",
          language: "TypeScript",
          stars: 28
        }
      ]
    },
    {
      id: 2,
      name: "Alex",
      age: 29,
      bio: "Passionate chef and weekend hiker. I believe the best conversations happen over good food and under starry skies.",
      distance: 7,
      photos: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=600&fit=crop&crop=face"
      ],
      interests: ["Cooking", "Hiking", "Music", "Movies"],
      github_url: "https://github.com/alex-chef",
      devpost_url: "https://devpost.com/alex-chef",
      linkedin_url: "https://linkedin.com/in/alex-johnson",
      github_projects: [
        {
          name: "recipe-finder",
          description: "AI-powered recipe recommendation app",
          language: "Python",
          stars: 67
        },
        {
          name: "hiking-tracker",
          description: "Track your mountain adventures",
          language: "React Native",
          stars: 35
        }
      ]
    },
    {
      id: 3,
      name: "Sofia",
      age: 24,
      bio: "Artist by day, dancer by night. Looking for someone who appreciates creativity and isn't afraid to be spontaneous.",
      distance: 5,
      photos: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=600&fit=crop&crop=face"
      ],
      interests: ["Art", "Dancing", "Music", "Fashion"],
      github_url: "https://github.com/sofia-art",
      devpost_url: "https://devpost.com/sofia-creates",
      github_projects: [
        {
          name: "digital-canvas",
          description: "Web-based digital art platform",
          language: "Vue.js",
          stars: 89
        },
        {
          name: "dance-choreographer",
          description: "App for creating dance routines",
          language: "Flutter",
          stars: 51
        }
      ]
    }
  ];

  useEffect(() => {
    setProfiles(sampleProfiles);
  }, []);

  const handleSwipe = (direction: 'up' | 'down') => {
    const currentProfile = profiles[currentIndex];
    
    if (direction === 'up') {
      const isMatch = Math.random() > 0.5;
      
      if (isMatch) {
        toast({
          title: "It's a Match! 💕",
          description: `You and ${currentProfile.name} liked each other!`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Like sent! 💖",
          description: `You liked ${currentProfile.name}`,
          duration: 2000,
        });
      }
    }

    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start instead of showing empty state
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="dating-gradient w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Hackathon Teammates</h1>
        <p className="text-gray-600">
          Profile {currentIndex + 1} of {profiles.length}
        </p>
      </div>
      
      <ProfileDisplay 
        profile={profiles[currentIndex]} 
        onSwipe={handleSwipe}
      />
      <SwipeButtons 
        onPass={() => handleSwipe('down')}
        onLike={() => handleSwipe('up')}
      />
    </div>
  );
};

export default DiscoverPage;
