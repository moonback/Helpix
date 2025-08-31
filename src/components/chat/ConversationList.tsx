import React, { useState, useEffect } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import { Conversation, ChatUser } from '@/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, MessageCircle, Plus, MoreVertical } from 'lucide-react';

interface ConversationListProps {
  onConversationSelect: (conversation: Conversation) => void;
  onCreateNewChat: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onConversationSelect,
  onCreateNewChat
}) => {
  const { conversations, isLoading, error, fetchConversations } = useMessageStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => {
        // Recherche dans les participants (noms d'utilisateur)
        const participantNames = conv.participants
          .filter(id => id !== user?.id)
          .map(id => getUserName(id))
          .join(' ')
          .toLowerCase();
        
        // Recherche dans le dernier message
        const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';
        
        return participantNames.includes(searchQuery.toLowerCase()) ||
               lastMessageContent.includes(searchQuery.toLowerCase());
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations, user?.id]);

  const getUserName = (userId: string): string => {
    // Ici vous pourriez récupérer le nom depuis un store d'utilisateurs
    // Pour l'instant, on utilise l'ID
    return userId;
  };

  const formatLastMessage = (message?: any): string => {
    if (!message) return 'Aucun message';
    
    const content = message.content;
    if (message.type === 'image') return '📷 Image';
    if (message.type === 'file') return '📎 Fichier';
    
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInHours < 48) return 'Hier';
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const getUnreadCount = (conversation: Conversation): number => {
    // Calculer le nombre de messages non lus pour cette conversation
    return conversation.unreadCount || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-2">Erreur: {error}</p>
        <Button onClick={fetchConversations} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Messages
          </h2>
          <Button
            onClick={onCreateNewChat}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation);
              const otherParticipantId = conversation.participants.find(id => id !== user?.id);
              const participantName = getUserName(otherParticipantId || '');
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {participantName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Contenu de la conversation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {participantName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage ? formatTimestamp(conversation.lastMessage.timestamp) : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {formatLastMessage(conversation.lastMessage)}
                        </p>
                        
                        {unreadCount > 0 && (
                          <span className="ml-2 flex-shrink-0 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu d'actions */}
                    <div className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Actions du menu (supprimer, archiver, etc.)
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
