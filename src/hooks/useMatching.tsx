
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  matched_user?: {
    id: string;
    name: string;
    photos: string[];
  };
}

export const useMatching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [newMatch, setNewMatch] = useState<Match | null>(null);

  // Fetch existing matches
  const fetchMatches = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        created_at
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    // Fetch profile data for matched users
    const matchesWithProfiles = await Promise.all(
      (data || []).map(async (match) => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, photos')
          .eq('id', otherUserId)
          .single();

        return {
          ...match,
          matched_user: profile
        };
      })
    );

    setMatches(matchesWithProfiles);
  };

  // Record a swipe
  const recordSwipe = async (swipedUserId: string, isLike: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('swipes')
      .insert({
        swiper_id: user.id,
        swiped_id: swipedUserId,
        is_like: isLike
      });

    if (error) {
      console.error('Error recording swipe:', error);
      return;
    }

    // Check if this created a new match by querying recent matches
    if (isLike) {
      setTimeout(async () => {
        const { data: newMatches } = await supabase
          .from('matches')
          .select(`
            id,
            user1_id,
            user2_id,
            created_at
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .gte('created_at', new Date(Date.now() - 5000).toISOString());

        if (newMatches && newMatches.length > 0) {
          const latestMatch = newMatches[0];
          const otherUserId = latestMatch.user1_id === user.id ? latestMatch.user2_id : latestMatch.user1_id;
          
          if (otherUserId === swipedUserId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, photos')
              .eq('id', otherUserId)
              .single();

            const matchWithProfile = {
              ...latestMatch,
              matched_user: profile
            };

            setNewMatch(matchWithProfile);
            setMatches(prev => [matchWithProfile, ...prev]);
          }
        }
      }, 1000);
    }
  };

  // Listen for new matches in real-time
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('matches-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New match detected:', payload);
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const clearNewMatch = () => setNewMatch(null);

  return {
    matches,
    newMatch,
    recordSwipe,
    clearNewMatch,
    refetchMatches: fetchMatches
  };
};
