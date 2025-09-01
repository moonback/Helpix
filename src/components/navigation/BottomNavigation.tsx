import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { Home, Map, Plus, Wallet, User, MessageCircle, BarChart3 } from 'lucide-react';

// Centralize the tab configuration for better readability and reusability
const navTabs = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/dashboard', icon: BarChart3, label: 'Tableau de bord' },
  { path: '/map', icon: Map, label: 'Carte' },
  { path: '/add', icon: Plus, label: 'Ajouter' },
  { path: '/chat', icon: MessageCircle, label: 'Messages' },
  { path: '/wallet', icon: Wallet, label: 'Portefeuille' },
  { path: '/profile', icon: User, label: 'Profil' },
];

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { unreadCount } = useMessageStore();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          const showBadge = tab.path === '/chat' && unreadCount > 0;

          return (
            <button
              key={tab.path}
              onClick={() => handleNavigation(tab.path)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full transition-colors
                ${isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon className="h-6 w-6 mb-1" />
                {showBadge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;