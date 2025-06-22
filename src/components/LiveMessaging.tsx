import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Heart, AlertCircle } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/hooks/useAuth';

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

interface LiveMessagingProps {
  match: Match;
  onBack: () => void;
}

const LiveMessaging = ({ match, onBack }: LiveMessagingProps) => {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useMessaging(match.id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('LIVE MESSAGING RENDER:', { matchId: match.id, messagesCount: messages.length, error });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    setSending(true);
    
    try {
      console.log('LIVE MESSAGING SENDING MESSAGE:', messageContent);
      await sendMessage(messageContent);
      console.log('LIVE MESSAGING MESSAGE SENT SUCCESSFULLY');
    } catch (error) {
      console.error('LIVE MESSAGING SEND ERROR:', error);
      // Optionally restore the message to input if sending failed
      // setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!match.matched_user) {
    console.error('LIVE MESSAGING ERROR - NO MATCHED USER DATA');
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600">Unable to load match data</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
          <img
            src={match.matched_user.photos?.[0] || '/placeholder.svg'}
            alt={match.matched_user.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{match.matched_user.name}</h3>
          <p className="text-sm text-gray-600">Matched just now</p>
        </div>

        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
          <Heart className="w-4 h-4 text-pink-500 fill-current" />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="dating-gradient w-8 h-8 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-500 fill-current" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start the conversation!</h3>
            <p className="text-gray-600">Say hello to {match.matched_user.name}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender_id === user?.id
                    ? 'dating-gradient text-white'
                    : 'bg-gray-100 text-gray-800'
                } ${message.id.startsWith('temp-') ? 'opacity-70' : ''}`}
              >
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === user?.id ? 'text-pink-100' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                  {message.id.startsWith('temp-') && ' (sending...)'}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${match.matched_user.name}...`}
              disabled={sending}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="dating-gradient text-white p-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveMessaging;
