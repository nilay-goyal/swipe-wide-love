
import { useState, useEffect } from 'react';
import ProfileDisplay from './discover/ProfileDisplay';
import SwipeButtons from './discover/SwipeButtons';
import MatchNotification from './MatchNotification';
import LiveMessaging from './LiveMessaging';
import { useToast } from '@/hooks/use-toast';
import { useMatching } from '@/hooks/useMatching';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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

const DiscoverPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { newMatch, recordSwipe, clearNewMatch } = useMatching();
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [swipedProfiles, setSwipedProfiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profiles from Supabase with improved error handling
  const fetchProfiles = async () => {
    if (!user) {
      console.log('No user found, cannot fetch profiles');
      setLoading(false);
      return;
    }

    console.log('Starting to fetch profiles for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .not('name', 'is', null)
        .neq('name', '');

      if (fetchError) {
        console.error('Error fetching profiles:', fetchError);
        setError('Failed to load profiles');
        setLoading(false);
        return;
      }

      console.log('Raw profiles data:', data);

      // Transform to match expected format and filter out swiped profiles
      const transformedProfiles = (data || [])
        .filter(profile => {
          // Filter out profiles with missing essential data
          const isValid = profile.name && profile.name.trim() !== '' && !swipedProfiles.has(profile.id);
          if (!isValid) {
            console.log('Filtering out invalid profile:', profile.id, profile.name);
          }
          return isValid;
        })
        .map(profile => ({
          id: profile.id,
          name: profile.name || 'Anonymous',
          age: profile.age || 25,
          bio: profile.bio || 'No bio available',
          distance: Math.floor(Math.random() * 20) + 1,
          photos: profile.photos || ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=600&fit=crop&crop=face'],
          interests: profile.interests || [],
          github_url: profile.github_url,
          devpost_url: profile.devpost_url,
          linkedin_url: profile.linkedin_url,
          github_projects: Array.isArray(profile.github_projects) ? profile.github_projects : []
        }));

      console.log('Transformed profiles:', transformedProfiles.length);
      setProfiles(transformedProfiles);
      
      if (transformedProfiles.length === 0) {
        setError('No more profiles to discover');
      }
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's existing swipes to filter them out
  const fetchSwipedProfiles = async () => {
    if (!user) return;

    console.log('Fetching swiped profiles for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      if (error) {
        console.error('Error fetching swiped profiles:', error);
        return;
      }

      // Properly type the swipes data
      const swipedIds = new Set<string>(
        (data as Array<{ swiped_id: string }>)?.map((swipe) => swipe.swiped_id) || []
      );
      console.log('Found swiped profiles:', swipedIds.size);
      setSwipedProfiles(swipedIds);
    } catch (error) {
      console.error('Error fetching swipes:', error);
      // Continue without filtering if swipes table doesn't exist yet
    }
  };

  useEffect(() => {
    if (user) {
      fetchSwipedProfiles();
    }
  }, [user]);

  useEffect(() => {
    if (user && swipedProfiles) {
      fetchProfiles();
    }
  }, [user, swipedProfiles]);

  // Add timeout for loading state
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        if (loading) {
          console.warn('Profile loading timed out');
          setError('Loading timed out. Please try again.');
          setLoading(false);
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const handleSwipe = async (direction: 'up' | 'down') => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    const isLike = direction === 'up';
    
    console.log('Handling swipe:', { profileId: currentProfile.id, isLike });
    
    // Record the swipe
    await recordSwipe(currentProfile.id, isLike);
    
    // Add to swiped profiles set
    setSwipedProfiles(prev => new Set([...prev, currentProfile.id]));

    if (isLike) {
      toast({
        title: "Like sent! 💖",
        description: `You liked ${currentProfile.name}`,
        duration: 2000,
      });
    }

    // Move to next profile
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Refresh profiles when we reach the end
      setCurrentIndex(0);
      setTimeout(() => {
        fetchProfiles();
      }, 1000);
    }
  };

  const handleStartChat = (match: any) => {
    setCurrentMatch(match);
    clearNewMatch();
  };

  const handleBackFromChat = () => {
    setCurrentMatch(null);
  };

  if (currentMatch) {
    return (
      <LiveMessaging
        match={currentMatch}
        onBack={handleBackFromChat}
      />
    );
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="dating-gradient w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="text-white text-2xl">⚠️</div>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchProfiles()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="dating-gradient w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="text-white text-2xl">🔍</div>
          </div>
          <p className="text-gray-600 mb-4">No more profiles to discover</p>
          <button 
            onClick={() => fetchProfiles()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Refresh
          </button>
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

      <MatchNotification
        match={newMatch}
        onClose={clearNewMatch}
        onStartChat={handleStartChat}
      />
    </div>
  );
};

export default DiscoverPage;
