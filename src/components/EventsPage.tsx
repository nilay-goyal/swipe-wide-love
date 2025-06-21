
import { useState } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  price: number;
  category: string;
}

const EventsPage = () => {
  const { toast } = useToast();
  const [joinedEvents, setJoinedEvents] = useState<number[]>([]);

  const sampleEvents: Event[] = [
    {
      id: 1,
      title: "Speed Dating Night",
      description: "Meet 12 potential matches in one evening! Fun, fast-paced dating event with drinks and appetizers included.",
      date: "2024-07-15",
      time: "7:00 PM",
      location: "The Rooftop Lounge",
      attendees: 18,
      maxAttendees: 24,
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=250&fit=crop",
      price: 35,
      category: "Speed Dating"
    },
    {
      id: 2,
      title: "Wine Tasting & Mixer",
      description: "Sophisticated evening of wine tasting with local sommelier. Perfect for meeting cultured singles.",
      date: "2024-07-18",
      time: "6:30 PM",
      location: "Vintage Wine Bar",
      attendees: 15,
      maxAttendees: 20,
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=250&fit=crop",
      price: 45,
      category: "Social"
    }
  ];

  const handleJoinEvent = (eventId: number, eventTitle: string) => {
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
        description: `You're registered for "${eventTitle}"`,
        duration: 3000,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dating Events Near You</h1>
        <p className="text-gray-600">Join exciting events and meet amazing people in person</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {sampleEvents.map((event) => {
          const isJoined = joinedEvents.includes(event.id);
          const spotsLeft = event.maxAttendees - event.attendees;
          
          return (
            <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
              <div className="flex h-64">
                <div className="w-2/5 relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-black/70 text-white px-2 py-1 rounded-full text-sm font-medium">
                      ${event.price}
                    </span>
                  </div>
                </div>

                <div className="w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.attendees} going • {spotsLeft} spots left</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinEvent(event.id, event.title)}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                      isJoined
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'dating-gradient text-white hover:opacity-90'
                    }`}
                  >
                    {isJoined ? 'Joined ✓' : 'Join Event'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsPage;
