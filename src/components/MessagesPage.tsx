import { useState, useEffect } from 'react';
import ConversationList from './messages/ConversationList';
import ChatWindow from './messages/ChatWindow';
import LiveMessaging from './LiveMessaging';
import { useMatching } from '@/hooks/useMatching';
import { useMessaging } from '@/hooks/useMessaging';

interface MessagesConversation {
  id: number;
  matchId: number; // Numeric ID for UI
  actualMatchId: string; // Actual UUID for database operations
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

  console.log('MessagesPage render - matches:', matches);

  // Transform matches into conversations
  useEffect(() => {
    console.log('Transforming matches to conversations:', matches);
    const transformedConversations = matches.map((match, index) => ({
      id: index + 1,
      matchId: index + 1, // Numeric ID for UI
      actualMatchId: match.id, // Actual UUID for database
      name: match.matched_user?.name || 'Unknown',
      photo: match.matched_user?.photos?.[0] || '/placeholder.svg',
      lastMessage: "Start your conversation!",
      lastMessageTime: "now",
      unread: false,
      isOnline: true,
      messages: []
    }));

    console.log('Transformed conversations:', transformedConversations);
    setConversations(transformedConversations);
  }, [matches]);

  const handleSelectConversation = (id: number) => {
    console.log('Selecting conversation with ID:', id);
    setSelectedConversation(id);
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      console.log('Found conversation:', conversation);
      // Find the match by the actual match ID
      const match = matches.find(m => m.id === conversation.actualMatchId);
      console.log('Found match for conversation:', match);
      setSelectedMatch(match);
    } else {
      console.error('Conversation not found for ID:', id);
    }
  };

  const handleBackFromLiveChat = () => {
    setSelectedMatch(null);
    setSelectedConversation(null);
  };

  if (selectedMatch) {
    console.log('Rendering LiveMessaging with match:', selectedMatch);
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
                {conversations.length === 0 && (
                  <div className="mt-4 p-4 bg-app-black/20 rounded-lg">
                    <p className="text-app-neutral/60 text-sm mb-2">No matches found</p>
                    <p className="text-app-neutral/40 text-xs">Matches count: {matches.length}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
