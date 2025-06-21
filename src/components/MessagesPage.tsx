
import { useState } from 'react';
import ConversationList from './messages/ConversationList';
import ChatWindow from './messages/ChatWindow';

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
        { id: 2, senderId: 0, text: "Hi Emma! I love your travel photos!", timestamp: "10:32 AM" },
        { id: 3, senderId: 1, text: "That sounds like a great plan! 😊", timestamp: "11:18 AM" }
      ]
    }
  ]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = (messageText: string) => {
    if (!selectedConversation) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation) {
        const newMsg: Message = {
          id: conv.messages.length + 1,
          senderId: 0,
          text: messageText,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        };
        
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: messageText,
          lastMessageTime: "now"
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden h-[600px]">
          <div className="flex h-full">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
            <ChatWindow
              conversation={selectedConv || null}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
