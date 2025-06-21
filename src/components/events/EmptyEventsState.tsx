
import { RefreshCw } from 'lucide-react';

interface EmptyEventsStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const EmptyEventsState = ({ onRefresh, isRefreshing }: EmptyEventsStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600 mb-4">No hackathon events found. Try refreshing to load the latest events.</p>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Loading...' : 'Load Events'}
      </button>
    </div>
  );
};

export default EmptyEventsState;
