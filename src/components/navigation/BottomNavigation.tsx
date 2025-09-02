import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { Home, Map, Plus, Wallet, User, MessageCircle, BarChart3, MoreHorizontal, Calendar, Package } from 'lucide-react';

// Centralize the tab configuration for better readability and reusability
// Primary tabs shown in the bar
const primaryTabs = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/map', icon: Map, label: 'Carte' },
  { path: '/chat', icon: MessageCircle, label: 'Messages' },
  { path: '/marketplace', icon: Package, label: 'Marketplace' },
];

// Overflow tabs shown in the More menu (keeps all links)
const overflowTabs = [
  { path: '/dashboard', icon: BarChart3, label: 'Tableau de bord' },
  { path: '/profile', icon: User, label: 'Profil' },
  { path: '/wallet', icon: Wallet, label: 'Portefeuille' },
  { path: '/rentals', icon: Calendar, label: 'Locations' },
];

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { unreadCount } = useMessageStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMoreOpen &&
        moreBtnRef.current &&
        moreMenuRef.current &&
        !moreBtnRef.current.contains(event.target as Node) &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Gradient backdrop for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      
      {/* Main navigation bar with glassmorphism effect */}
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 pb-[env(safe-area-inset-bottom)] z-40">
        {/* Subtle inner glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        {/* Bar content - uniform spacing with grid */}
        <div className="grid grid-cols-5 items-center h-16 px-2">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            const showBadge = tab.path === '/chat' && unreadCount > 0;

            return (
              <button
                key={tab.path}
                onClick={() => handleNavigation(tab.path)}
                className={`
                  group relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ease-out
                  hover:scale-105 active:scale-95
                  ${isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator with animation */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-[fadeInScale_0.3s_ease-out]" />
                )}
                
                {/* Icon with hover glow */}
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-200 ${
                    isActive ? 'bg-blue-500/20 opacity-100' : 'opacity-0 group-hover:opacity-50 group-hover:bg-gray-500/10'
                  }`} />
                  <Icon className={`relative h-6 w-6 mb-1 transition-all duration-200 ${
                    isActive ? 'drop-shadow-sm' : 'group-hover:scale-110'
                  }`} />
                  
                  {/* Badge with pulse animation */}
                  {showBadge && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] shadow-lg animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                
                {/* Label with fade animation */}
                <span className={`hidden sm:block text-[10px] font-medium transition-all duration-200 ${
                  isActive ? 'opacity-100 font-semibold' : 'opacity-75 group-hover:opacity-100'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More menu trigger with enhanced styling */}
          <button
            ref={moreBtnRef}
            onClick={() => setIsMoreOpen((v) => !v)}
            className={`
              group relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ease-out
              hover:scale-105 active:scale-95
              ${isMoreOpen 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
            aria-label="Plus"
            aria-expanded={isMoreOpen}
            aria-haspopup="menu"
          >
            {/* Active indicator */}
            {isMoreOpen && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-[fadeInScale_0.3s_ease-out]" />
            )}
            
            {/* Icon with rotation animation */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-200 ${
                isMoreOpen ? 'bg-blue-500/20 opacity-100' : 'opacity-0 group-hover:opacity-50 group-hover:bg-gray-500/10'
              }`} />
              <MoreHorizontal className={`relative h-6 w-6 mb-1 transition-all duration-200 ${
                isMoreOpen ? 'rotate-90 drop-shadow-sm' : 'group-hover:scale-110'
              }`} />
            </div>
            
            <span className={`hidden sm:block text-[10px] font-medium transition-all duration-200 ${
              isMoreOpen ? 'opacity-100 font-semibold' : 'opacity-75 group-hover:opacity-100'
            }`}>
              Plus
            </span>
          </button>
        </div>

        {/* Floating Add Action Button aligned and scaled like other icons */}
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2">
          <button
            onClick={() => handleNavigation('/add')}
            className="pointer-events-auto group relative h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-xl ring-4 ring-white/80 dark:ring-gray-900/80 hover:shadow-blue-500/25 transition-all duration-300 ease-out hover:scale-105 active:scale-95"
            aria-label="Ajouter"
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            
            {/* Plus icon with rotation on hover */}
            <Plus className="relative h-6 w-6 transition-transform duration-200 group-hover:rotate-90" />
            
            {/* Subtle pulse effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-active:opacity-100" />
          </button>
        </div>

        {/* More menu popover with enhanced styling */}
        {isMoreOpen && (
          <>
            {/* Backdrop blur */}
            <div 
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 animate-[fadeIn_0.2s_ease-out]"
              onClick={() => setIsMoreOpen(false)}
            />
            
            <div
              ref={moreMenuRef}
              role="menu"
              className="absolute bottom-16 right-2 mb-2 w-52 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-[slideUpFade_0.3s_ease-out] origin-bottom-right"
            >
              {/* Menu header with gradient */}
              <div className="px-3 py-2 mb-1">
                <div className="h-1 w-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full mx-auto opacity-50" />
              </div>
              
              {overflowTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <button
                    key={tab.path}
                    onClick={() => {
                      handleNavigation(tab.path);
                      setIsMoreOpen(false);
                    }}
                    className={`
                      group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs transition-all duration-200 ease-out
                      hover:scale-[1.02] active:scale-98
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-950/50 dark:to-blue-900/50 dark:text-blue-300 shadow-sm'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50'
                      }
                    `}
                    role="menuitem"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: 'slideInRight 0.3s ease-out both'
                    }}
                  >
                    {/* Icon with glow effect */}
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-lg blur-sm transition-opacity duration-200 ${
                        isActive ? 'bg-blue-500/20 opacity-100' : 'opacity-0 group-hover:opacity-30 group-hover:bg-gray-500/20'
                      }`} />
                      <Icon className={`relative h-5 w-5 transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                    </div>
                    
                    <span className={`font-medium transition-all duration-200 ${
                      isActive ? 'font-semibold' : 'group-hover:translate-x-0.5'
                    }`}>
                      {tab.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {/* Custom keyframe animations */}
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateX(-50%) scaleX(0);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scaleX(1);
          }
        }
        
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </nav>
  );
};

export default BottomNavigation;