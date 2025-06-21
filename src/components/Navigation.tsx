
import { useState } from 'react';
import { Heart, Calendar, Star, MessageSquare, Users } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  messageCount?: number;
}

const Navigation = ({ currentPage, onPageChange, messageCount = 0 }: NavigationProps) => {
  const navItems = [
    { id: 'discover', label: 'Discover', icon: Heart },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'premium', label: 'Premium', icon: Star },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: Users },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-pink-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 dating-gradient rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">LoveMatch</span>
          </div>

          {/* Navigation Items */}
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all duration-200 relative ${
                    isActive 
                      ? 'text-pink-600 bg-pink-50' 
                      : 'text-gray-600 hover:text-pink-500 hover:bg-pink-25'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-pink-600' : ''}`} />
                  <span className="text-sm font-medium mt-1">{item.label}</span>
                  
                  {/* Message notification badge */}
                  {item.id === 'messages' && messageCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {messageCount > 9 ? '9+' : messageCount}
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 dating-gradient rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <button className="dating-gradient text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
            Upgrade
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
