
import { useState, useEffect } from 'react';
import ConversationList from './messages/ConversationList';
import ChatWindow from './messages/ChatWindow';
import LiveMessaging from './LiveMessaging';
import { useMatching } from '@/hooks/useMatching';
import { useMessaging } from '@/hooks/useMessaging';

interface MessagesConversation {
  id: number;
  matchId: number; // Changed from string to number to match ConversationList interface
  name: string;
  photo: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  isOnline: boolean;
  messages: any[];
}

const MessagesPage = () => {
  const { matches } = useMatching();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [conversations, setConversations] = useState<MessagesConversation[]>([]);

  // Transform matches into conversations
  useEffect(() => {
    const transformedConversations = matches.map((match, index) => ({
      id: index + 1,
      matchId: index + 1, // Use numeric ID instead of string
      name: match.matched_user?.name || 'Unknown',
      photo: match.matched_user?.photos?.[0] || '/placeholder.svg',
      lastMessage: "Start your conversation!",
      lastMessageTime: "now",
      unread: false,
      isOnline: true,
      messages: []
    }));

    setConversations(transformedConversations);
  }, [matches]);

  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id);
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      // Find the match by index since we're using index-based IDs
      const match = matches[conversation.id - 1];
      setSelectedMatch(match);
    }
  };

  const handleBackFromLiveChat = () => {
    setSelectedMatch(null);
    setSelectedConversation(null);
  };

  if (selectedMatch) {
    return (
      <LiveMessaging
        match={selectedMatch}
        onBack={handleBackFromLiveChat}
      />
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden h-[600px]">
          <div className="flex h-full">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
            />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 dating-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Match</h3>
                <p className="text-gray-600">Choose a match to start messaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
