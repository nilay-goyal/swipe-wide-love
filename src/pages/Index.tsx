
import { useState } from 'react';
import Navigation from '../components/Navigation';
import DiscoverPage from '../components/DiscoverPage';
import EventsPage from '../components/EventsPage';
import PremiumPage from '../components/PremiumPage';
import MessagesPage from '../components/MessagesPage';
import ProfilePage from '../components/ProfilePage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('discover');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'discover':
        return <DiscoverPage />;
      case 'events':
        return <EventsPage />;
      case 'premium':
        return <PremiumPage />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DiscoverPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 pb-32">
      <main className="container mx-auto px-4 pt-8">
        {renderCurrentPage()}
      </main>
      
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        messageCount={3}
      />
    </div>
  );
};

export default Index;
