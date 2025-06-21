
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserHackathons } from '@/hooks/useUserHackathons';
import EventsHeader from './EventsHeader';
import HackathonCard from './HackathonCard';

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
  const { joinedEvents, joinHackathon, leaveHackathon } = useUserHackathons();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleJoinEvent = async (eventId: string, eventTitle: string, mlhUrl: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join hackathons",
        variant: "destructive",
      });
      return;
    }

    const isJoined = joinedEvents.includes(eventId);
    
    if (isJoined) {
      const success = await leaveHackathon(eventId);
      if (success) {
        toast({
          title: "Left Hackathon",
          description: `You've left "${eventTitle}"`,
          duration: 2000,
        });
      }
    } else {
      if (mlhUrl) {
        window.open(mlhUrl, '_blank', 'noopener,noreferrer');
        
        setTimeout(() => {
          const confirmed = window.confirm(
            `Did you successfully register for "${eventTitle}" on the MLH website? Click OK only if you were accepted and registered.`
          );
          
          if (confirmed) {
            joinHackathon(eventId).then((success) => {
              if (success) {
                toast({
                  title: "Hackathon Joined! 🎉",
                  description: `Successfully recorded participation in "${eventTitle}"`,
                  duration: 3000,
                });
              }
            });
          }
        }, 2000);
      } else {
        toast({
          title: "No Registration Link",
          description: "MLH registration link not available for this event",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="text-2xl font-semibold text-gray-600">Loading hackathon events...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <EventsHeader onRefresh={scrapeNewEvents} refreshing={refreshing} />

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No hackathon events found. Try refreshing to load the latest events.</p>
          <button
            onClick={scrapeNewEvents}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Loading...' : 'Load Events'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {events.map((event) => (
            <HackathonCard
              key={event.id}
              event={event}
              isJoined={joinedEvents.includes(event.id)}
              onJoinEvent={handleJoinEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
