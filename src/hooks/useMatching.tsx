
import { useState, useEffect, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const subscriptionRef = useRef<boolean>(false);

  // Fetch existing matches
  const fetchMatches = async () => {
    if (!user) return;

    try {
      console.log('Fetching matches for user:', user.id);
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
        (data || []).map(async (match: any) => {
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
      console.log('Fetched matches successfully:', matchesWithProfiles.length);
    } catch (error) {
      console.error('Error in fetchMatches:', error);
    }
  };

  // Record a swipe
  const recordSwipe = async (swipedUserId: string, isLike: boolean) => {
    if (!user) return;

    try {
      console.log('Recording swipe:', { swipedUserId, isLike });
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
          try {
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
          } catch (error) {
            console.error('Error checking for new matches:', error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error in recordSwipe:', error);
    }
  };

  // Clean up subscription helper
  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('Cleaning up matches channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      subscriptionRef.current = false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user || subscriptionRef.current) return;

    // Clean up any existing subscription
    cleanupSubscription();

    // Create new channel with unique name
    const channelName = `matches-${user.id}-${Date.now()}`;
    console.log('Creating matches channel:', channelName);
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('New match detected:', payload);
          const newMatch = payload.new as any;
          if (newMatch.user1_id === user.id || newMatch.user2_id === user.id) {
            fetchMatches();
          }
        }
      )
      .subscribe((status) => {
        console.log('Matches subscription status:', status);
        if (status === 'SUBSCRIBED') {
          subscriptionRef.current = true;
          console.log('Successfully subscribed to matches channel');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Matches subscription error:', status);
          subscriptionRef.current = false;
        }
      });

    return cleanupSubscription;
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupSubscription;
  }, []);

  const clearNewMatch = () => setNewMatch(null);

  return {
    matches,
    newMatch,
    recordSwipe,
    clearNewMatch,
    refetchMatches: fetchMatches
  };
};
