import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import DiscoverPage from '../components/DiscoverPage';
import EventsPage from '../components/EventsPage';
import PremiumPage from '../components/PremiumPage';
import MessagesPage from '../components/MessagesPage';
import ProfilePage from '../components/ProfilePage';
import AuthPage from '../components/AuthPage';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('profile');
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-black flex items-center justify-center">
        <div className="text-2xl font-semibold text-app-neutral">Loading...</div>
      </div>
    );
  }

  if (showAuth) {
    return <AuthPage onAuthSuccess={() => setShowAuth(false)} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'discover':
        return user ? <DiscoverPage /> : <AuthPage onAuthSuccess={() => setShowAuth(false)} />;
      case 'events':
        return user ? <EventsPage /> : <AuthPage onAuthSuccess={() => setShowAuth(false)} />;
      case 'premium':
        return user ? <PremiumPage /> : <AuthPage onAuthSuccess={() => setShowAuth(false)} />;
      case 'messages':
        return user ? <MessagesPage /> : <AuthPage onAuthSuccess={() => setShowAuth(false)} />;
      case 'profile':
        return <ProfilePage onEditRequireAuth={() => setShowAuth(true)} />;
      default:
        return <ProfilePage onEditRequireAuth={() => setShowAuth(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-app-black pb-32">
      {/* Company Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-app-slate/95 backdrop-blur-md border-b border-app-white/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-app-amber rounded-full flex items-center justify-center border-2 border-app-white">
              <div className="w-4 h-4 bg-app-black rounded-full relative">
                <div className="absolute top-1 left-1 w-2 h-2 bg-app-amber rounded-full"></div>
              </div>
            </div>
            <h1 className="text-xl font-bold text-app-amber">
              CTRL + F
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-20">
        {renderCurrentPage()}
      </main>
      
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Index;
