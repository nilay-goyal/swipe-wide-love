
import { Heart, Calendar, Star, MessageSquare, Users } from 'lucide-react';
import { useMatching } from '@/hooks/useMatching';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation = ({ currentPage, onPageChange }: NavigationProps) => {
  const { matches } = useMatching();
  
  const navItems = [
    { id: 'discover', label: 'Discover', icon: Heart },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'premium', label: 'Premium', icon: Star },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: Users },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex space-x-4 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl border border-white/20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const messageCount = item.id === 'messages' ? matches.length : 0;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'dating-gradient text-white shadow-lg scale-110' 
                  : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'
              }`}
            >
              <Icon className="w-6 h-6" />
              
              {item.id === 'messages' && messageCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {messageCount > 9 ? '9+' : messageCount}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
