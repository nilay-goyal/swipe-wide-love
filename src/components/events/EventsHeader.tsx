
import { RefreshCw } from 'lucide-react';

interface EventsHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

const EventsHeader = ({ onRefresh, refreshing }: EventsHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-app-amber mb-2">MLH Hackathon Events</h1>
      <p className="text-app-neutral mb-4">Discover amazing hackathons from Major League Hacking</p>
      
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center px-4 py-2 bg-app-amber text-app-black rounded-lg hover:bg-app-amber/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : 'Refresh Events'}
      </button>
    </div>
  );
};

export default EventsHeader;
