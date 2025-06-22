
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMatching } from '../hooks/useMatching';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import ProfileCard from './ProfileCard';
import SwipeButtons from './discover/SwipeButtons';
import FilterDropdown from './discover/FilterDropdown';
import { geminiMatchingService, type User as GeminiUser, type GeminiMatchResult } from '@/services/geminiMatchingService';

interface User {
  id: string;
  name: string | null;
  age: number | null;
  bio: string | null;
  location: string | null;
  photos: string[] | null;
  interests: string[] | null;
  occupation: string | null;
  education: string | null;
  github_url: string | null;
  devpost_url: string | null;
  linkedin_url: string | null;
  github_projects: any[];
  work_experience: any[];
  education_details: any[];
  linkedin: string | null;
  github: string | null;
  devpost: string | null;
  major: string | null;
  school: string | null;
  year: string | null;
  uiux: number | null;
  pitching: number | null;
  management: number | null;
  hardware: number | null;
  cyber: number | null;
  frontend: number | null;
  backend: number | null;
  skills: string[] | null;
}

const DiscoverPage = () => {
  const { user } = useAuth();
  const { swipeUser } = useMatching();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [originalUsers, setOriginalUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<{ hackathonId: string | null; prompt: string }>({
    hackathonId: null,
    prompt: ''
  });

  const fetchUsers = useCallback(async (hackathonId?: string | null) => {
    if (!user) return;

    try {
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

      // Build the query to exclude current user and already swiped profiles
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      // Only add the not-in filter if there are swiped profiles
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      // If hackathon filter is applied, filter by users in that hackathon
      if (hackathonId) {
        const { data: participantsData, error: participantsError } = await supabase
          .from('hackathon_participants')
          .select('user_id')
          .eq('event_id', hackathonId);

        if (participantsError) throw participantsError;

        const participantIds = participantsData?.map(p => p.user_id) || [];
        if (participantIds.length > 0) {
          query = query.in('id', participantIds);
        } else {
          // No participants in this hackathon
          setUsers([]);
          setOriginalUsers([]);
          return;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      const fetchedUsers = (data || []) as User[];
      setUsers(fetchedUsers);
      setOriginalUsers(fetchedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error loading profiles",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    const isLike = direction === 'right';

    try {
      await swipeUser(currentUser.id, isLike);
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error swiping:', error);
      toast({
        title: "Error",
        description: "Failed to record swipe",
        variant: "destructive",
      });
    }
  };

  const handleFilterApply = async (hackathonId: string | null, geminiPrompt: string) => {
    setLoading(true);
    setShowFilter(false);
    setAppliedFilter({ hackathonId, prompt: geminiPrompt });
    setCurrentIndex(0);

    try {
      // First fetch users based on hackathon filter
      await fetchUsers(hackathonId);

      // If there's a Gemini prompt, apply AI matching
      if (geminiPrompt.trim() && originalUsers.length > 0) {
        console.log('Applying Gemini matching with prompt:', geminiPrompt);
        
        // Convert users to format expected by Gemini service
        const geminiUsers: GeminiUser[] = originalUsers.map(user => ({
          id: user.id,
          name: user.name,
          skills: user.skills,
          interests: user.interests,
          bio: user.bio,
          major: user.major,
          school: user.school,
          year: user.year,
          occupation: user.occupation,
          uiux: user.uiux,
          pitching: user.pitching,
          management: user.management,
          hardware: user.hardware,
          cyber: user.cyber,
          frontend: user.frontend,
          backend: user.backend
        }));

        // Get Gemini match results
        const matchResults: GeminiMatchResult[] = await geminiMatchingService.matchUsersWithPrompt(
          geminiPrompt,
          geminiUsers
        );

        // Reorder users based on Gemini scores
        const reorderedUsers = matchResults
          .map(result => originalUsers.find(user => user.id === result.userId))
          .filter(user => user !== undefined) as User[];

        console.log('Reordered users based on Gemini matching:', reorderedUsers.length);
        setUsers(reorderedUsers);

        toast({
          title: "AI Matching Applied! 🤖",
          description: `Found ${reorderedUsers.length} potential teammates ranked by compatibility`,
        });
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      toast({
        title: "Error",
        description: "Failed to apply filter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update users when originalUsers changes and there's no Gemini prompt
  useEffect(() => {
    if (!appliedFilter.prompt) {
      setUsers(originalUsers);
    }
  }, [originalUsers, appliedFilter.prompt]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="text-2xl font-semibold text-app-neutral">Loading profiles...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <div className="text-2xl font-semibold text-app-neutral">Please sign in to discover hackathon teammates</div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="py-8 relative">
      {/* Filter Button */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-app-amber">Discover Teammates</h2>
        <Button
          onClick={() => setShowFilter(!showFilter)}
          variant="outline"
          className="border-app-amber text-app-amber hover:bg-app-amber hover:text-app-black"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Filter Dropdown */}
      <FilterDropdown
        isOpen={showFilter}
        onToggle={() => setShowFilter(!showFilter)}
        onFilterApply={handleFilterApply}
      />

      {/* Applied Filter Info */}
      {(appliedFilter.hackathonId || appliedFilter.prompt) && (
        <div className="mb-4 p-3 bg-app-slate/50 rounded-lg border border-app-white/20">
          <div className="text-sm text-app-neutral">
            {appliedFilter.hackathonId && (
              <div>🎯 Filtered by hackathon participants</div>
            )}
            {appliedFilter.prompt && (
              <div>🤖 AI matching applied: "{appliedFilter.prompt.substring(0, 60)}..."</div>
            )}
          </div>
        </div>
      )}

      {/* Profile Cards */}
      <div className="max-w-md mx-auto">
        {currentUser ? (
          <div className="relative">
            <ProfileCard user={currentUser} />
            <SwipeButtons
              onSwipeLeft={() => handleSwipe('left')}
              onSwipeRight={() => handleSwipe('right')}
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-app-amber mb-2">
              No more profiles!
            </h3>
            <p className="text-app-neutral">
              {appliedFilter.hackathonId || appliedFilter.prompt 
                ? "You've seen all profiles matching your filters. Try adjusting your filters to see more teammates."
                : "You've seen all available profiles. Check back later for new hackathon participants!"
              }
            </p>
            {(appliedFilter.hackathonId || appliedFilter.prompt) && (
              <Button
                onClick={() => handleFilterApply(null, '')}
                className="mt-4 bg-app-amber text-app-black hover:bg-app-amber/90"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {users.length > 0 && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="text-app-neutral text-sm">
            {Math.min(currentIndex + 1, users.length)} / {users.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
