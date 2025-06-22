
import { useState } from 'react';
import { Send, Smile, Heart } from 'lucide-react';

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  matchId: number;
  name: string;
  photo: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  isOnline: boolean;
  messages: Message[];
}

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (message: string) => void;
}

const ChatWindow = ({ conversation, onSendMessage }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-app-amber rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-app-black" />
          </div>
          <h3 className="text-xl font-semibold text-app-amber mb-2">Select a Conversation</h3>
          <p className="text-app-neutral">Choose a match to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 border-b border-app-white/20 flex items-center space-x-3">
        <div className="relative">
          <img
            src={conversation.photo}
            alt={conversation.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {conversation.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-app-slate"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-app-amber">{conversation.name}</h3>
          <p className="text-sm text-app-neutral/80">
            {conversation.isOnline ? 'Online now' : 'Last seen recently'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.senderId === 0
                  ? 'bg-app-amber text-app-black'
                  : 'bg-app-black border border-app-white/20 text-app-neutral'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === 0 ? 'text-app-black/70' : 'text-app-neutral/60'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-app-white/20">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-app-black border border-app-white/30 text-app-neutral rounded-full focus:outline-none focus:ring-2 focus:ring-app-amber focus:border-app-amber"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-neutral/60 hover:text-app-neutral">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-app-amber text-app-black p-3 rounded-full hover:bg-app-amber/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
