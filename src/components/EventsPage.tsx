
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import EventsHeader from './events/EventsHeader';
import EventCard from './events/EventCard';
import EmptyEventsState from './events/EmptyEventsState';

interface HackathonEvent {
  id: string;
  title: string;
  description: string;
  date_start: string | null;
  date_end: string | null;
  location: string;
  image_url: string;
  mlh_url: string;
  application_deadline: string | null;
  difficulty_level: string | null;
}

const EventsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathon_events')
        .select('*')
        .order('date_start', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load hackathon events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserParticipation = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('hackathon_participants')
        .select('event_id')
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user participation:', error);
        return;
      }
      setJoinedEventIds(data?.map((p: any) => p.event_id) || []);
    } catch (error) {
      console.error('Error fetching user participation:', error);
    }
  };

  const scrapeNewEvents = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-mlh-events');
      
      if (error) throw error;
      
      toast({
        title: "Events Updated! 🎉",
        description: "Successfully refreshed hackathon events from MLH",
      });
      
      await fetchEvents();
    } catch (error) {
      console.error('Error scraping events:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to update events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const findUserByName = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .ilike('name', `%${name}%`)
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error finding user by name:', error);
      return null;
    }
  };

  const createTeamRelationship = async (eventId: string, teammateId: string) => {
    if (!user) return;

    try {
      // Ensure consistent ordering for team members
      const member1Id = user.id < teammateId ? user.id : teammateId;
      const member2Id = user.id < teammateId ? teammateId : user.id;

      const { error } = await supabase
        .from('hackathon_teams')
        .insert({
          event_id: eventId,
          member1_id: member1Id,
          member2_id: member2Id
        });

      if (error && error.code !== '23505') { // Ignore duplicate constraint errors
        throw error;
      }

      // Create a match between the users
      const { error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: member1Id,
          user2_id: member2Id
        });

      if (matchError && matchError.code !== '23505') { // Ignore duplicate constraint errors
        throw matchError;
      }

    } catch (error) {
      console.error('Error creating team relationship:', error);
      throw error;
    }
  };

  const handleJoinEvent = async (eventId: string, eventTitle: string, teammateName?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join hackathons",
        variant: "destructive",
      });
      return;
    }

    const isAlreadyJoined = joinedEventIds.includes(eventId);
    
    if (isAlreadyJoined) {
      // Remove participation
      try {
        const { error } = await supabase
          .from('hackathon_participants')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;
        
        setJoinedEventIds(prev => prev.filter(id => id !== eventId));
        toast({
          title: "Left Hackathon",
          description: `You've left "${eventTitle}"`,
          duration: 2000,
        });
      } catch (error) {
        console.error('Error leaving hackathon:', error);
        toast({
          title: "Error",
          description: "Failed to leave hackathon",
          variant: "destructive",
        });
      }
    } else {
      // Join hackathon
      try {
        const { error } = await supabase
          .from('hackathon_participants')
          .insert({
            user_id: user.id,
            event_id: eventId,
            is_verified: true
          });

        if (error) throw error;
        
        setJoinedEventIds(prev => [...prev, eventId]);

        // If teammate name is provided, try to find and connect them
        if (teammateName) {
          const teammate = await findUserByName(teammateName);
          if (teammate) {
            await createTeamRelationship(eventId, teammate.id);
            toast({
              title: "Hackathon Joined! 🎉",
              description: `You've joined "${eventTitle}" and sent a match request to ${teammate.name}`,
              duration: 3000,
            });
          } else {
            toast({
              title: "Hackathon Joined! ⚠️",
              description: `You've joined "${eventTitle}" but couldn't find teammate "${teammateName}". They may need to join the platform first.`,
              duration: 4000,
            });
          }
        } else {
          toast({
            title: "Hackathon Joined! 🎉",
            description: `You've been verified as a participant in "${eventTitle}"`,
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error joining hackathon:', error);
        toast({
          title: "Error",
          description: "Failed to join hackathon",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserParticipation();
    }
  }, [user]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="text-2xl font-semibold text-app-neutral">Loading hackathon events...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <EventsHeader onRefresh={scrapeNewEvents} refreshing={refreshing} />

      {events.length === 0 ? (
        <EmptyEventsState onRefresh={scrapeNewEvents} refreshing={refreshing} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {events.map((event) => {
            const isJoined = joinedEventIds.includes(event.id);
            
            return (
              <EventCard
                key={event.id}
                event={event}
                isJoined={isJoined}
                onJoinEvent={handleJoinEvent}
                formatDate={formatDate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
