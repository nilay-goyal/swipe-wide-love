
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathon_events')
        .select('*')
        .order('date_start', { ascending: true, nullsLast: true });

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

  const handleJoinEvent = (eventId: string, eventTitle: string) => {
    if (joinedEvents.includes(eventId)) {
      setJoinedEvents(joinedEvents.filter(id => id !== eventId));
      toast({
        title: "Left Event",
        description: `You've left "${eventTitle}"`,
        duration: 2000,
      });
    } else {
      setJoinedEvents([...joinedEvents, eventId]);
      toast({
        title: "Event Joined! 🎉",
        description: `You're interested in "${eventTitle}"`,
        duration: 3000,
      });
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
        <div className="text-2xl font-semibold text-gray-600">Loading hackathon events...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">MLH Hackathon Events</h1>
        <p className="text-gray-600 mb-4">Discover amazing hackathons from Major League Hacking</p>
        
        <button
          onClick={scrapeNewEvents}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Events'}
        </button>
      </div>

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
          {events.map((event) => {
            const isJoined = joinedEvents.includes(event.id);
            
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
                <div className="flex h-64">
                  <div className="w-2/5 relative">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Hackathon
                      </span>
                    </div>
                    {event.difficulty_level && (
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-black/70 text-white px-2 py-1 rounded-full text-sm font-medium">
                          {event.difficulty_level}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-3/5 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {event.description || 'Amazing hackathon opportunity to build, learn, and connect with fellow developers.'}
                      </p>
                      
                      <div className="space-y-2">
                        {event.date_start && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                              {formatDate(event.date_start)}
                              {event.date_end && event.date_end !== event.date_start && 
                                ` - ${formatDate(event.date_end)}`
                              }
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.location || 'Location TBA'}</span>
                        </div>
                        
                        {event.application_deadline && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Apply by {formatDate(event.application_deadline)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleJoinEvent(event.id, event.title)}
                        className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                          isJoined
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'dating-gradient text-white hover:opacity-90'
                        }`}
                      >
                        {isJoined ? 'Interested ✓' : 'Mark Interested'}
                      </button>
                      
                      {event.mlh_url && (
                        <a
                          href={event.mlh_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2 text-center text-pink-600 hover:text-pink-700 font-medium text-sm border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
                        >
                          View on MLH →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
