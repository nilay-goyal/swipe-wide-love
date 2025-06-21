
import { useState } from 'react';
import { Send, Heart, Smile } from 'lucide-react';

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

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      matchId: 1,
      name: "Emma",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      lastMessage: "That sounds like a great plan! 😊",
      lastMessageTime: "2m ago",
      unread: true,
      isOnline: true,
      messages: [
        { id: 1, senderId: 1, text: "Hey! Thanks for the match 😊", timestamp: "10:30 AM" },
        { id: 2, senderId: 0, text: "Hi Emma! I love your travel photos, especially the one from Italy!", timestamp: "10:32 AM" },
        { id: 3, senderId: 1, text: "Thank you! That was an amazing trip. Do you enjoy traveling too?", timestamp: "10:35 AM" },
        { id: 4, senderId: 0, text: "Absolutely! I'm planning a trip to Greece this summer. Any recommendations?", timestamp: "10:40 AM" },
        { id: 5, senderId: 1, text: "Oh Greece is incredible! You have to visit Santorini and Mykonos. The sunsets are breathtaking!", timestamp: "10:42 AM" },
        { id: 6, senderId: 0, text: "That sounds perfect! Maybe we could grab coffee and you can tell me more about your travels?", timestamp: "11:15 AM" },
        { id: 7, senderId: 1, text: "That sounds like a great plan! 😊", timestamp: "11:18 AM" }
      ]
    },
    {
      id: 2,
      matchId: 2,
      name: "Alex",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      lastMessage: "Would love to cook together sometime!",
      lastMessageTime: "1h ago",
      unread: false,
      isOnline: false,
      messages: [
        { id: 1, senderId: 2, text: "Hi there! I see you're into cooking too!", timestamp: "Yesterday" },
        { id: 2, senderId: 0, text: "Yes! I saw your pasta dish on your profile - it looked amazing!", timestamp: "Yesterday" },
        { id: 3, senderId: 2, text: "Thanks! I love experimenting with new recipes. What's your signature dish?", timestamp: "Yesterday" },
        { id: 4, senderId: 0, text: "I make a mean risotto! It's all about the timing and patience.", timestamp: "Yesterday" },
        { id: 5, senderId: 2, text: "Would love to cook together sometime!", timestamp: "1h ago" }
      ]
    },
    {
      id: 3,
      matchId: 3,
      name: "Sofia",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      lastMessage: "The art exhibition was amazing!",
      lastMessageTime: "3h ago",
      unread: true,
      isOnline: true,
      messages: [
        { id: 1, senderId: 3, text: "Hey! I noticed we both love art 🎨", timestamp: "Today" },
        { id: 2, senderId: 0, text: "Yes! I just went to the modern art museum last weekend", timestamp: "Today" },
        { id: 3, senderId: 3, text: "The art exhibition was amazing!", timestamp: "3h ago" }
      ]
    }
  ]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation) {
        const newMsg: Message = {
          id: conv.messages.length + 1,
          senderId: 0, // Current user
          text: newMessage,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        };
        
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage,
          lastMessageTime: "now"
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden h-[600px]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                <p className="text-gray-600 text-sm mt-1">{conversations.length} conversations</p>
              </div>
              
              <div className="overflow-y-auto h-full">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedConversation === conv.id ? 'bg-pink-50 border-r-2 border-pink-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={conv.photo}
                          alt={conv.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {conv.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 truncate">{conv.name}</h3>
                          <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                        </div>
                        <p className={`text-sm truncate ${conv.unread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                      
                      {conv.unread && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={selectedConv.photo}
                        alt={selectedConv.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {selectedConv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedConv.name}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedConv.isOnline ? 'Online now' : 'Last seen recently'}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {selectedConv.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.senderId === 0
                              ? 'dating-gradient text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === 0 ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <Smile className="w-5 h-5" />
                        </button>
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="dating-gradient text-white p-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 dating-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Conversation</h3>
                    <p className="text-gray-600">Choose a match to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
