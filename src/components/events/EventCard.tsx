
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';

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
  onJoinEvent: (eventId: string, eventTitle: string, mlhUrl: string) => void;
  formatDate: (dateString: string | null) => string;
}

const EventCard = ({ event, isJoined, onJoinEvent, formatDate }: EventCardProps) => {
  return (
    <div className="bg-app-slate border border-app-white/20 rounded-2xl shadow-lg overflow-hidden card-hover">
      <div className="flex h-64">
        <div className="w-2/5 relative">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-app-amber text-app-black px-2 py-1 rounded-full text-xs font-medium">
              Hackathon
            </span>
          </div>
          {event.difficulty_level && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-app-black/70 text-app-white px-2 py-1 rounded-full text-sm font-medium">
                {event.difficulty_level}
              </span>
            </div>
          )}
        </div>

        <div className="w-3/5 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-app-amber mb-2">{event.title}</h3>
            <p className="text-app-neutral text-sm mb-4 line-clamp-3">
              {event.description || 'Amazing hackathon opportunity to build, learn, and connect with fellow developers.'}
            </p>
            
            <div className="space-y-2">
              {event.date_start && (
                <div className="flex items-center text-app-neutral/80 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-app-amber" />
                  <span>
                    {formatDate(event.date_start)}
                    {event.date_end && event.date_end !== event.date_start && 
                      ` - ${formatDate(event.date_end)}`
                    }
                  </span>
                </div>
              )}
              
              <div className="flex items-center text-app-neutral/80 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-app-amber" />
                <span>{event.location || 'Location TBA'}</span>
              </div>
              
              {event.application_deadline && (
                <div className="flex items-center text-app-neutral/80 text-sm">
                  <Clock className="w-4 h-4 mr-2 text-app-amber" />
                  <span>Apply by {formatDate(event.application_deadline)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onJoinEvent(event.id, event.title, event.mlh_url)}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isJoined
                  ? 'bg-green-900/20 text-green-400 border border-green-400/30 hover:bg-green-900/30'
                  : 'bg-app-amber text-app-black hover:bg-app-amber/90'
              }`}
            >
              {isJoined ? (
                <>
                  <span>Joined Hackathon ✓</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Join Hackathon</span>
                </>
              )}
            </button>
            
            {isJoined && (
              <p className="text-xs text-center text-app-neutral/60 leading-tight">
                ⚠️ Only mark as joined if you've been accepted into the hackathon
              </p>
            )}
            
            {event.mlh_url && !isJoined && (
              <a
                href={event.mlh_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 text-center text-app-amber hover:text-app-amber/80 font-medium text-sm border border-app-amber/30 rounded-lg hover:bg-app-amber/10 transition-colors"
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
