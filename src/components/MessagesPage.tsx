import { useState, useEffect } from 'react';
import ConversationList from './messages/ConversationList';
import ChatWindow from './messages/ChatWindow';
import LiveMessaging from './LiveMessaging';
import { useMatching } from '@/hooks/useMatching';
import { useMessaging } from '@/hooks/useMessaging';

interface MessagesConversation {
  id: string; // Changed back to string to use actual match ID
  matchId: string; // Use actual match ID
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
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [conversations, setConversations] = useState<MessagesConversation[]>([]);

  // Transform matches into conversations
  useEffect(() => {
    console.log('MessagesPage: Transforming matches into conversations', matches);
    const transformedConversations = matches.map((match) => ({
      id: match.id, // Use actual match ID
      matchId: match.id, // Use actual match ID
      name: match.matched_user?.name || 'Unknown',
      photo: match.matched_user?.photos?.[0] || '/placeholder.svg',
      lastMessage: "Start your conversation!",
      lastMessageTime: "now",
      unread: false,
      isOnline: true,
      messages: []
    }));

    console.log('MessagesPage: Transformed conversations', transformedConversations);
    setConversations(transformedConversations);
  }, [matches]);

  const handleSelectConversation = (id: string) => {
    console.log('MessagesPage: Selecting conversation', id);
    setSelectedConversation(id);
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      // Find the match by actual ID
      const match = matches.find(m => m.id === id);
      console.log('MessagesPage: Found match for conversation', match);
      setSelectedMatch(match);
    } else {
      console.log('MessagesPage: No conversation found for id', id);
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
        <div className="bg-app-slate border border-app-white/20 rounded-3xl shadow-lg overflow-hidden h-[600px]">
          <div className="flex h-full">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
            />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-app-amber rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-app-amber mb-2">Select a Match</h3>
                <p className="text-app-neutral">Choose a match to start messaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
