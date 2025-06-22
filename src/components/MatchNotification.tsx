
import { useEffect } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  matched_user?: {
    id: string;
    name: string;
    photos: string[];
  };
}

interface MatchNotificationProps {
  match: Match | null;
  onClose: () => void;
  onStartChat: (match: Match) => void;
}

const MatchNotification = ({ match, onClose, onStartChat }: MatchNotificationProps) => {
  useEffect(() => {
    if (match) {
      // Auto-hide after 10 seconds
      const timer = setTimeout(onClose, 10000);
      return () => clearTimeout(timer);
    }
  }, [match, onClose]);

  if (!match || !match.matched_user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-pink-500 fill-current" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">It's a Match! 🎉</h2>
          <p className="text-gray-600">You and {match.matched_user.name} liked each other!</p>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-200 mr-4">
            <img
              src={match.matched_user.photos?.[0] || '/placeholder.svg'}
              alt="Your profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-200 ml-4">
            <img
              src={match.matched_user.photos?.[0] || '/placeholder.svg'}
              alt={match.matched_user.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onStartChat(match)}
            className="w-full dating-gradient text-white py-3 px-6 rounded-full font-semibold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Start Chatting</span>
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchNotification;
