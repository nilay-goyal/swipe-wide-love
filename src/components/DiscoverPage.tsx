
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMatching } from '@/hooks/useMatching';
import { useToast } from '@/hooks/use-toast';
import ProfileDisplay from './discover/ProfileDisplay';
import SwipeButtons from './discover/SwipeButtons';

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
  const { recordSwipe } = useMatching();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      console.log('Fetching profiles for user:', user.id);
      
      // Get profiles that the current user has already swiped on
      const { data: swipedProfiles, error: swipeError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      if (swipeError) {
        console.error('Error fetching swiped profiles:', swipeError);
        throw swipeError;
      }

      const swipedIds = swipedProfiles?.map(swipe => swipe.swiped_id) || [];
      console.log('Already swiped on:', swipedIds.length, 'profiles');

      // Build the query to exclude current user and already swiped profiles
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      // Only add the not-in filter if there are swiped profiles
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Raw profiles data:', data?.length || 0, 'profiles found');

      if (!data || data.length === 0) {
        console.log('No profiles found');
        setProfiles([]);
        setError('No new profiles to discover');
        return;
      }

      // Transform profiles - require at least name and some content
      const transformedProfiles = data
        .filter(profile => {
          const hasName = profile.name && profile.name.trim() !== '';
          const hasContent = profile.bio || profile.interests?.length > 0 || profile.github_url || profile.linkedin_url;
          
          if (!hasName || !hasContent) {
            console.log('Filtering out incomplete profile:', profile.id, { hasName, hasContent });
            return false;
          }
          return true;
        })
        .map(profile => ({
          id: profile.id,
          name: profile.name,
          age: profile.age || 20,
          bio: profile.bio || '',
          distance: Math.floor(Math.random() * 50) + 1, // Mock distance
          photos: profile.photos || ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face'],
          interests: profile.interests || [],
          github_url: profile.github_url,
          devpost_url: profile.devpost_url,
          linkedin_url: profile.linkedin_url,
          github_projects: Array.isArray(profile.github_projects) ? profile.github_projects : []
        }));

      console.log('Transformed profiles:', transformedProfiles.length);
      setProfiles(transformedProfiles);
      setCurrentIndex(0);
      setError(null);

    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setError('Failed to load profiles. Please try again.');
      toast({
        title: "Error loading profiles",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);
      fetchProfiles();
    }
  }, [user]);

  const handleSwipe = async (direction: 'up' | 'down') => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    const isLike = direction === 'up';

    await recordSwipe(currentProfile.id, isLike);

    toast({
      title: isLike ? "Liked! ❤️" : "Passed ✋",
      description: isLike 
        ? `You liked ${currentProfile.name}` 
        : `You passed on ${currentProfile.name}`,
      duration: 2000,
    });

    setCurrentIndex(prev => prev + 1);
  };

  const handlePass = () => handleSwipe('down');
  const handleLike = () => handleSwipe('up');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-app-amber border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-app-neutral">Finding amazing people for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl">😕</div>
        <h3 className="text-xl font-semibold text-app-amber">{error}</h3>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchProfiles();
          }}
          className="px-4 py-2 bg-app-amber text-app-black rounded-lg hover:bg-app-amber/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl">🎉</div>
        <h3 className="text-xl font-semibold text-app-amber">You've seen everyone!</h3>
        <p className="text-app-neutral text-center max-w-md">
          Check back later for new profiles, or update your preferences to see more people.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchProfiles();
          }}
          className="px-4 py-2 bg-app-amber text-app-black rounded-lg hover:bg-app-amber/90 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl">✨</div>
        <h3 className="text-xl font-semibold text-gray-800">All caught up!</h3>
        <p className="text-gray-600 text-center max-w-md">
          You've swiped through all available profiles. Check back later for new matches!
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setLoading(true);
            fetchProfiles();
          }}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-app-amber mb-2">Discover</h1>
          <p className="text-app-neutral">
            Profile {currentIndex + 1} of {profiles.length}
          </p>
        </div>

        <ProfileDisplay
          profile={currentProfile}
          onSwipe={handleSwipe}
        />

        <SwipeButtons onPass={handlePass} onLike={handleLike} />
      </div>
    </div>
  );
};

export default DiscoverPage;
