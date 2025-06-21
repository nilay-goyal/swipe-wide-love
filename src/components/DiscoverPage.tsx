
import { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  distance: number;
  photos: string[];
  interests: string[];
}

const DiscoverPage = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample profiles data
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
      interests: ["Travel", "Photography", "Yoga", "Books"]
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
      interests: ["Cooking", "Hiking", "Music", "Movies"]
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
      interests: ["Art", "Dancing", "Music", "Fashion"]
    },
    {
      id: 4,
      name: "Marcus",
      age: 31,
      bio: "Tech entrepreneur with a love for fitness and mindfulness. Seeking a genuine connection with someone who values growth and adventure.",
      distance: 2,
      photos: [
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=600&fit=crop&crop=face"
      ],
      interests: ["Technology", "Fitness", "Meditation", "Business"]
    },
    {
      id: 5,
      name: "Luna",
      age: 27,
      bio: "Environmental scientist who loves the outdoors. Let's swap stories around a campfire or discover hidden gems in the city together.",
      distance: 9,
      photos: [
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=600&fit=crop&crop=face"
      ],
      interests: ["Nature", "Science", "Camping", "Sustainability"]
    }
  ];

  useEffect(() => {
    setProfiles(sampleProfiles);
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentProfile = profiles[currentIndex];
    
    if (direction === 'right') {
      // Simulate 50% match rate
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

    // Move to next profile
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: "No more profiles",
        description: "Check back later for more potential matches!",
        duration: 3000,
      });
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="dating-gradient w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading amazing profiles for you...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-24 h-24 dating-gradient rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You're all caught up!</h2>
          <p className="text-gray-600 mb-6">Check back later for more potential matches</p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setProfiles([...sampleProfiles]);
            }}
            className="dating-gradient text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Discover Amazing People</h1>
        <p className="text-gray-600">
          Profile {currentIndex + 1} of {profiles.length}
        </p>
      </div>
      
      <ProfileCard
        profile={profiles[currentIndex]}
        onSwipe={handleSwipe}
      />
    </div>
  );
};

export default DiscoverPage;
