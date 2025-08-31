import React, { useState, useEffect } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import { Conversation } from '@/types';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Search, UserPlus, MessageCircle } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { currentConversation, setCurrentConversation } = useMessageStore();
  const { user } = useAuthStore();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

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

    try {
      // Créer une nouvelle conversation
      await useMessageStore.getState().createConversation([user.id, selectedUserId]);
      setShowNewChat(false);
      setSearchUser('');
      setSelectedUserId('');
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const handleCancelNewChat = () => {
    setShowNewChat(false);
    setSearchUser('');
    setSelectedUserId('');
  };

  // Composant pour créer un nouveau chat
  const NewChatForm = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelNewChat}
            className="p-2"
          >
            ←
          </Button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nouveau chat
          </h2>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher un utilisateur
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Entrez l'ID ou l'email de l'utilisateur..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID de l'utilisateur
            </label>
            <Input
              type="text"
              placeholder="ID de l'utilisateur"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleStartChat}
              disabled={!selectedUserId.trim()}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Commencer la conversation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex">
      {/* Sidebar - Liste des conversations */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700">
        {showNewChat ? (
          <NewChatForm />
        ) : (
          <ConversationList
            onConversationSelect={handleConversationSelect}
            onCreateNewChat={handleCreateNewChat}
          />
        )}
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 hidden md:block">
        <ChatWindow
          conversation={currentConversation}
          onBack={handleBack}
        />
      </div>

      {/* Version mobile - Chat plein écran */}
      {currentConversation && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden">
          <ChatWindow
            conversation={currentConversation}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
