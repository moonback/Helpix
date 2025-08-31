import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Map, 
  Plus, 
  Wallet, 
  User 
} from 'lucide-react';
import { TabType } from '@/types';

const navigationItems = [
  { id: 'home' as TabType, label: 'Accueil', icon: Home, path: '/' },
  { id: 'map' as TabType, label: 'Carte', icon: Map, path: '/map' },
  { id: 'add' as TabType, label: 'Ajouter', icon: Plus, path: '/add' },
  { id: 'wallet' as TabType, label: 'Wallet', icon: Wallet, path: '/wallet' },
  { id: 'profile' as TabType, label: 'Profil', icon: User, path: '/profile' },
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon 
                size={24} 
                className={`mb-1 ${isActive ? 'text-primary-600' : 'text-gray-500'}`}
              />
              <span className={`text-xs font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  className="absolute -top-1 w-2 h-2 bg-primary-600 rounded-full"
                  layoutId="activeTab"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
