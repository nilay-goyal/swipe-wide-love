
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHackathonEvents } from '@/hooks/useHackathonEvents';
import EventsHeader from './events/EventsHeader';
import HackathonEventCard from './events/HackathonEventCard';
import EmptyEventsState from './events/EmptyEventsState';

const EventsPage = () => {
  const { toast } = useToast();
  const { events, loading, refreshing, scrapeNewEvents } = useHackathonEvents();
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

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

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="text-2xl font-semibold text-gray-600">Loading hackathon events...</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <EventsHeader onRefresh={scrapeNewEvents} isRefreshing={refreshing} />

      {events.length === 0 ? (
        <EmptyEventsState onRefresh={scrapeNewEvents} isRefreshing={refreshing} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {events.map((event) => (
            <HackathonEventCard
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
