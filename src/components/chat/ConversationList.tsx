import React, { useEffect, useState } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

interface ConversationListProps {
  onConversationSelect: (conversation: any) => void;
  onCreateNewChat?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onConversationSelect, onCreateNewChat }) => {
  const { conversations, isLoading, error, fetchConversations } = useMessageStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Charger les conversations au montage du composant
    fetchConversations();
    
    // Rafraîchir automatiquement toutes les 30 secondes
    const interval = setInterval(() => {
      fetchConversations();
    }, 30000);
    
    // Nettoyer l'intervalle au démontage
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const filteredConversations = conversations.filter(conv =>
    conv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="bg-red-50 border-red-200">
          <div className="text-red-800">
            <h3 className="font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-sm mb-3">{error}</p>
            <Button 
              onClick={() => fetchConversations()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Affichage temporaire pour test
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Rechercher des conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={() => fetchConversations()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Chargement...</span>
            </div>
          ) : (
            'Actualiser'
          )}
        </Button>
        {onCreateNewChat && (
          <Button 
            onClick={onCreateNewChat}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            +
          </Button>
        )}
      </div>

      {/* Titre de la section */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">💬 Messagerie</h2>
        <p className="text-sm text-gray-600 mb-2">Gérez vos conversations et échangez avec d'autres utilisateurs</p>
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Rafraîchissement automatique activé</span>
        </div>
      </div>

      {/* Affichage des conversations si disponibles */}
      {conversations.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Conversations ({conversations.length})</h3>
          <div className="text-xs text-gray-500">
            Dernière mise à jour : {new Date().toLocaleTimeString()}
          </div>
        </div>
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="p-3 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] border-2 border-transparent"
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {conversation.participants?.length || 0}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Conversation avec {conversation.participants?.length || 0} participant(s)
                      </p>
                      <p className="text-sm text-gray-500">
                        Créée le {new Date(conversation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {conversation.lastMessage && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 truncate">
                        <span className="font-medium">Dernier message :</span> {conversation.lastMessage.content}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right flex flex-col items-end space-y-1">
                  <p className="text-xs text-gray-400">
                    Modifiée le {new Date(conversation.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Cliquer pour ouvrir
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 border-gray-200">
          <div className="text-gray-600 p-4 text-center">
            <p>Aucune conversation trouvée</p>
            <p className="text-sm mt-1">Créez une nouvelle conversation pour commencer</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConversationList;
