
import { Calendar, MapPin, Clock } from 'lucide-react';

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

interface EventCardProps {
  event: HackathonEvent;
  isJoined: boolean;
  onJoinEvent: (eventId: string, eventTitle: string) => void;
  formatDate: (dateString: string | null) => string;
}

const EventCard = ({ event, isJoined, onJoinEvent, formatDate }: EventCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
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
              onClick={() => onJoinEvent(event.id, event.title)}
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
};

export default EventCard;
