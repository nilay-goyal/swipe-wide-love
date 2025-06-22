
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
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

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

  const fetchUserJoinedEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('joined_events')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setJoinedEvents(data?.joined_events || []);
    } catch (error) {
      console.error('Error fetching joined events:', error);
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
      
      // Refetch events after scraping
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

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserJoinedEvents();
    }
  }, [user]);

  const handleJoinEvent = async (eventId: string, eventTitle: string, mlhUrl: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join hackathons",
        variant: "destructive",
      });
      return;
    }

    const isAlreadyJoined = joinedEvents.includes(eventId);
    
    if (isAlreadyJoined) {
      // Remove from joined events
      const updatedEvents = joinedEvents.filter(id => id !== eventId);
      
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ joined_events: updatedEvents })
          .eq('id', user.id);

        if (error) throw error;
        
        setJoinedEvents(updatedEvents);
        toast({
          title: "Left Hackathon",
          description: `You've left "${eventTitle}"`,
          duration: 2000,
        });
      } catch (error) {
        console.error('Error updating joined events:', error);
        toast({
          title: "Error",
          description: "Failed to update your joined events",
          variant: "destructive",
        });
      }
    } else {
      // Add to joined events and redirect to MLH
      const updatedEvents = [...joinedEvents, eventId];
      
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ joined_events: updatedEvents })
          .eq('id', user.id);

        if (error) throw error;
        
        setJoinedEvents(updatedEvents);
        toast({
          title: "Hackathon Joined! 🎉",
          description: `You've joined "${eventTitle}". Redirecting to MLH...`,
          duration: 3000,
        });

        // Redirect to MLH page
        if (mlhUrl) {
          window.open(mlhUrl, '_blank');
        }
      } catch (error) {
        console.error('Error updating joined events:', error);
        toast({
          title: "Error",
          description: "Failed to update your joined events",
          variant: "destructive",
        });
      }
    }
  };

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
            const isJoined = joinedEvents.includes(event.id);
            
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
