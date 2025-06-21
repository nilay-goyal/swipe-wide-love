
import { RefreshCw } from 'lucide-react';

interface EventsHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

const EventsHeader = ({ onRefresh, refreshing }: EventsHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">MLH Hackathon Events</h1>
      <p className="text-gray-600 mb-4">Discover amazing hackathons from Major League Hacking</p>
      
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : 'Refresh Events'}
      </button>
    </div>
  );
};

export default EventsHeader;
