
import { RefreshCw } from 'lucide-react';

interface EmptyEventsStateProps {
  onRefresh: () => void;
  refreshing: boolean;
}

const EmptyEventsState = ({ onRefresh, refreshing }: EmptyEventsStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-app-neutral mb-4">No hackathon events found. Try refreshing to load the latest events.</p>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center px-4 py-2 bg-app-amber text-app-black rounded-lg hover:bg-app-amber/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Loading...' : 'Load Events'}
      </button>
    </div>
  );
};

export default EmptyEventsState;
