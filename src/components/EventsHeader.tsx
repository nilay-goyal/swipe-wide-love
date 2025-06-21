
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface EventsHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

const EventsHeader = ({ onRefresh, refreshing }: EventsHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">MLH Hackathon Events</h1>
      <p className="text-gray-600 mb-4">Discover amazing hackathons from Major League Hacking</p>
      
      {/* Important Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-4xl mx-auto">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
          <div className="text-left">
            <p className="text-sm font-medium text-yellow-800">
              <strong>IMPORTANT:</strong> Only click "Joined Hackathon" if you have been accepted and registered on the MLH website!
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              The button will redirect you to the official MLH registration page first.
            </p>
          </div>
        </div>
      </div>
      
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
