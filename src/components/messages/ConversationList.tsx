
interface Conversation {
  id: number;
  matchId: number;
  name: string;
  photo: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  isOnline: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: number | null;
  onSelectConversation: (id: number) => void;
}

const ConversationList = ({ conversations, selectedConversation, onSelectConversation }: ConversationListProps) => {
  return (
    <div className="w-1/3 border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        <p className="text-gray-600 text-sm mt-1">{conversations.length} conversations</p>
      </div>
      
      <div className="overflow-y-auto h-full">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
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
  );
};

export default ConversationList;
