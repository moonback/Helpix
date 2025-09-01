import React, { useState } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import { Conversation } from '@/types';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, MessageCircle } from 'lucide-react';

// Styles CSS personnalisés pour les animations
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
`;

const ChatPage: React.FC = () => {
  const { currentConversation, setCurrentConversation, conversations, deleteConversation } = useMessageStore();
  const { user } = useAuthStore();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleConversationSelect = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const handleBack = () => {
    setCurrentConversation(null);
  };

  const handleCreateNewChat = () => {
    setShowNewChat(true);
  };

  const handleStartChat = async () => {
    if (!selectedUserId.trim() || !user) return;

    setIsCreating(true);
    try {
      // Créer une nouvelle conversation
      await useMessageStore.getState().createConversation([user.id, selectedUserId]);
      setShowNewChat(false);
      setSearchUser('');
      setSelectedUserId('');
      
      // Afficher un message de succès
      console.log('Conversation créée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      // Ici vous pourriez ajouter une notification d'erreur
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelNewChat = () => {
    setShowNewChat(false);
    setSearchUser('');
    setSelectedUserId('');
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedConversations(new Set());
  };

  const handleSelectConversation = (conversationId: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set());
    } else {
      setSelectedConversations(new Set(conversations.map(c => c.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedConversations.size === 0) return;

    setIsDeletingMultiple(true);
    try {
      const deletePromises = Array.from(selectedConversations).map(id => deleteConversation(id));
      await Promise.all(deletePromises);
      const deletedCount = selectedConversations.size;
      setSelectedConversations(new Set());
      setIsMultiSelectMode(false);
      setNotification({ 
        message: `${deletedCount} conversation(s) supprimée(s) avec succès !`, 
        type: 'success' 
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression des conversations:', error);
      setNotification({ 
        message: 'Erreur lors de la suppression des conversations', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  // Composant pour créer un nouveau chat
  const NewChatForm = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header élégant */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelNewChat}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Nouveau chat</h2>
            <p className="text-blue-100 text-sm">Créez une nouvelle conversation</p>
          </div>
        </div>
      </div>

      {/* Contenu du formulaire */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Section de recherche */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              🔍 Rechercher un utilisateur
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Entrez l'ID ou l'email de l'utilisateur..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Section ID utilisateur */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              👤 ID de l'utilisateur
            </label>
            <Input
              type="text"
              placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Entrez l'identifiant unique de l'utilisateur avec qui vous souhaitez discuter
            </p>
          </div>

          {/* Bouton d'action */}
          <div className="pt-4">
            <Button
              onClick={handleStartChat}
              disabled={!selectedUserId.trim() || isCreating}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isCreating ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Création en cours...</span>
                </div>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-3" />
                  Commencer la conversation
                </>
              )}
            </Button>
          </div>

          {/* Informations supplémentaires */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>La conversation sera créée instantanément</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Composant de notification
  const Notification = () => {
    if (!notification) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="w-5 h-5">
            {notification.type === 'success' ? (
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="font-medium">{notification.message}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{customStyles}</style>
      <Notification />
      <div className="h-full flex bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
        {/* Sidebar - Liste des conversations */}
        <div className="w-full md:w-72 lg:w-80 border-r border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg transition-all duration-300 ease-in-out">
          <div className={`transform transition-all duration-300 ease-in-out ${showNewChat ? 'translate-x-0' : 'translate-x-0'}`}>
            {showNewChat ? (
              <NewChatForm />
            ) : (
              <ConversationList
                onConversationSelect={handleConversationSelect}
                onCreateNewChat={handleCreateNewChat}
                isMultiSelectMode={isMultiSelectMode}
                selectedConversations={selectedConversations}
                onSelectConversation={handleSelectConversation}
                onToggleMultiSelect={handleToggleMultiSelect}
                onSelectAll={handleSelectAll}
                onDeleteSelected={handleDeleteSelected}
                isDeletingMultiple={isDeletingMultiple}
              />
            )}
          </div>
        </div>

        {/* Zone de chat principale */}
        <div className="flex-1 hidden md:block bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm transition-all duration-300 ease-in-out">
          {currentConversation ? (
            <div className="animate-fadeIn">
              <ChatWindow
                conversation={currentConversation}
                onBack={handleBack}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center animate-fadeIn">
              <div className="text-center space-y-6 max-w-lg mx-auto px-6">
                {/* Icône animée */}
                <div className="relative">
                  <div className="w-28 h-28 mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  </div>
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"></div>
                </div>
                
                {/* Contenu textuel */}
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Bienvenue dans la messagerie
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                    Sélectionnez une conversation existante ou créez-en une nouvelle pour commencer à échanger avec d'autres utilisateurs
                  </p>
                </div>
                
                {/* Actions rapides */}
                <div className="flex items-center justify-center space-x-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Messagerie en temps réel</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Notifications instantanées</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Version mobile - Chat plein écran */}
        {currentConversation && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 md:hidden">
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
