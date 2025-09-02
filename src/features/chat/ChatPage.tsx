import React, { useState, useCallback } from 'react';
import { useMessageStore } from '@/stores/messageStore';

import { Conversation } from '@/types';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import { Search, MessageCircle, RefreshCw, Filter, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';

// Enhanced CSS styles with more modern animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  @keyframes slideIn {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .animate-slideIn {
    animation: slideIn 0.4s ease-out forwards;
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.5s ease-out forwards;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .animate-bounce-gentle {
    animation: bounce-gentle 2s ease-in-out infinite;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .dark .glass-effect {
    background: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .gradient-border {
    background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .dark .hover-lift:hover {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  }
`;

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
}

const ChatPage: React.FC = () => {
  const { currentConversation, setCurrentConversation, conversations, deleteConversation, markConversationAsRead } = useMessageStore();

  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filterOption, setFilterOption] = useState<'all' | 'unread' | 'favorites' | 'archived'>('all');
  const [sortOption, setSortOption] = useState<'recent' | 'alphabetical' | 'unread'>('recent');

  // Enhanced notification system
  const addNotification = useCallback((message: string, type: NotificationState['type'] = 'info') => {
    const id = Date.now().toString();
    const newNotification: NotificationState = { message, type, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleRefresh = useCallback(() => {
    // Logique de rafraîchissement
    setLastUpdate(new Date());
    addNotification('Conversations actualisées', 'success');
  }, [addNotification]);



  const handleConversationSelect = useCallback((conversation: Conversation) => {
    setCurrentConversation(conversation);
    try {
      // Marquer comme lue immédiatement à l'ouverture
      // @ts-ignore store peut accepter l'id string
      markConversationAsRead(conversation.id);
    } catch {}
  }, [setCurrentConversation, markConversationAsRead]);

  const handleBack = useCallback(() => {
    setCurrentConversation(null);
  }, [setCurrentConversation]);

  const handleToggleMultiSelect = useCallback(() => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedConversations(new Set());
  }, [isMultiSelectMode]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  }, [selectedConversations]);

  const handleSelectAll = useCallback(() => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set());
    } else {
      setSelectedConversations(new Set(conversations.map(c => c.id)));
    }
  }, [selectedConversations.size, conversations]);

  const handleDeleteSelected = async () => {
    if (selectedConversations.size === 0) {
      addNotification('Aucune conversation sélectionnée', 'error');
      return;
    }

    setIsDeletingMultiple(true);
    try {
      const deletePromises = Array.from(selectedConversations).map(id => deleteConversation(id));
      await Promise.all(deletePromises);
      const deletedCount = selectedConversations.size;
      setSelectedConversations(new Set());
      setIsMultiSelectMode(false);
      addNotification(`${deletedCount} conversation(s) supprimée(s) avec succès !`, 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression des conversations:', error);
      addNotification('Erreur lors de la suppression des conversations', 'error');
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  // Enhanced Notification System
  const NotificationContainer = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="animate-fadeIn transform transition-all duration-300 hover:scale-105"
          >
            <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 min-w-80 ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                : notification.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
            }`}>
              <div className="w-6 h-6 flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg fill="currentColor" viewBox="0 0 20 20" className="animate-bounce-gentle">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : notification.type === 'error' ? (
                  <svg fill="currentColor" viewBox="0 0 20 20" className="animate-pulse">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="font-medium flex-1 text-sm">{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="w-5 h-5 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{customStyles}</style>
      <style>{`html, body { overflow: hidden !important; height: 100% !important; }`}</style>
      <NotificationContainer />
      <div className="fixed top-0 left-0 h-screen w-screen flex bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
        {/* Enhanced Sidebar - Amélioré pour le responsive */}
        <div className="w-full sm:w-80 lg:w-96 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 shadow-2xl h-full overflow-hidden flex flex-col">
          {/* Enhanced Header */}
          <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse-slow">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Messages</h1>
                <p className="text-blue-100 text-[10px]">{conversations.length} conversations</p>
              </div>
            </div>
            
            {/* Actions du header */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowSearch(!showSearch)}
                variant="ghost"
                size="sm"
                className={`p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 ${
                  showSearch ? 'bg-white/20' : ''
                }`}
                title="Rechercher des conversations"
              >
                <Search className="w-4 h-4 text-white" />
              </Button>
              
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                title="Actualiser les conversations"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </Button>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="ghost"
                size="sm"
                className={`p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 ${
                  showFilters ? 'bg-white/20' : ''
                }`}
                title="Filtres et tri"
              >
                <Filter className="w-4 h-4 text-white" />
              </Button>
              
              {/* Indicateur de dernière mise à jour */}
              <div className="hidden sm:flex items-center space-x-1 text-[10px] text-blue-100 ml-2">
                <Clock className="w-3 h-3" />
                <span>{lastUpdate.toLocaleTimeString('fr-FR', { timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>
          
          {/* Barre de recherche */}
          {showSearch && (
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 animate-fadeIn">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher des conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600/30 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Effacer la recherche"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Filtres et tri */}
          {showFilters && (
            <div className="p-4 bg-white/30 dark:bg-slate-800/30 border-b border-gray-200 dark:border-slate-700 animate-fadeIn">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer :</span>
                  <select 
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value as any)}
                    className="text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1"
                  >
                    <option value="all">Toutes</option>
                    <option value="unread">Non lues</option>
                    <option value="favorites">Favorites</option>
                    <option value="archived">Archivées</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trier par :</span>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1"
                  >
                    <option value="recent">Plus récent</option>
                    <option value="alphabetical">Alphabétique</option>
                    <option value="unread">Non lues</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <div className={`flex-1 transition-all duration-500 ease-in-out overflow-hidden`}>
            <ConversationList
              onConversationSelect={handleConversationSelect}
              isMultiSelectMode={isMultiSelectMode}
              selectedConversations={selectedConversations}
              onSelectConversation={handleSelectConversation}
              onToggleMultiSelect={handleToggleMultiSelect}
              onSelectAll={handleSelectAll}
              onDeleteSelected={handleDeleteSelected}
              isDeletingMultiple={isDeletingMultiple}
              searchQuery={searchQuery}
              filterOption={filterOption}
              sortOption={sortOption}
            />
          </div>
        </div>

        {/* Enhanced Main Chat Area - Amélioré pour le responsive */}
        <div className="flex-1 hidden sm:block bg-white dark:bg-slate-900 h-full overflow-hidden">
          {currentConversation ? (
            <ChatWindow
              conversation={currentConversation}
              onBack={handleBack}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
              <div className="text-center space-y-8 max-w-md mx-auto px-6 animate-fadeIn">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse-slow shadow-2xl">
                  <MessageCircle className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Bienvenue dans la messagerie
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                    Sélectionnez une conversation pour commencer à discuter
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Mobile Chat Window - Amélioré pour le responsive */}
        {currentConversation && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 sm:hidden animate-slideInRight h-screen w-screen overflow-hidden">
            <ChatWindow
              conversation={currentConversation}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ChatPage;