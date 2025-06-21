
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserHackathons = () => {
  const { user } = useAuth();
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

  const fetchUserHackathons = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_hackathons', { user_uuid: user.id });

      if (error) {
        console.log('RPC function error, using fallback:', error);
        return;
      }
      
      const eventIds = data?.map((item: any) => item.hackathon_event_id) || [];
      setJoinedEvents(eventIds);
    } catch (error) {
      console.error('Error fetching user hackathons:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserHackathons();
    }
  }, [user]);

  const joinHackathon = async (eventId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .rpc('join_hackathon', { 
          user_uuid: user.id, 
          event_uuid: eventId 
        });

      if (error) throw error;
      
      setJoinedEvents([...joinedEvents, eventId]);
      return true;
    } catch (error) {
      console.error('Error joining hackathon:', error);
      return false;
    }
  };

  const leaveHackathon = async (eventId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .rpc('leave_hackathon', { 
          user_uuid: user.id, 
          event_uuid: eventId 
        });

      if (error) throw error;
      
      setJoinedEvents(joinedEvents.filter(id => id !== eventId));
      return true;
    } catch (error) {
      console.error('Error leaving hackathon:', error);
      return false;
    }
  };

  return {
    joinedEvents,
    joinHackathon,
    leaveHackathon,
    refetch: fetchUserHackathons
  };
};
