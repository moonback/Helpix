import React, { useEffect, useState } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Trash2, AlertTriangle, CheckSquare, Square } from 'lucide-react';

interface ConversationListProps {
  onConversationSelect: (conversation: any) => void;
  onCreateNewChat?: () => void;
  isMultiSelectMode?: boolean;
  selectedConversations?: Set<string>;
  onSelectConversation?: (conversationId: string) => void;
  onToggleMultiSelect?: () => void;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  isDeletingMultiple?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  onConversationSelect, 
  onCreateNewChat,
  isMultiSelectMode = false,
  selectedConversations = new Set(),
  onSelectConversation,
  onToggleMultiSelect,
  onSelectAll,
  onDeleteSelected,
  isDeletingMultiple = false
}) => {
  const { conversations, isLoading, error, fetchConversations, deleteConversation } = useMessageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Charger les conversations au montage du composant
    fetchConversations();
    
    // Rafraîchir automatiquement toutes les 2 minutes (plus raisonnable)
    const interval = setInterval(() => {
      // Vérifier que l'utilisateur est actif avant de rafraîchir
      if (!document.hidden) {
        fetchConversations();
      }
    }, 120000); // 2 minutes au lieu de 30 secondes
    
    // Écouter les changements de visibilité de la page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Rafraîchir quand l'utilisateur revient sur la page
        fetchConversations();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Nettoyer l'intervalle et l'event listener au démontage
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // ✅ Dépendances vides - exécution unique au montage

  const filteredConversations = conversations.filter(conv =>
    conv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConversation = async (conversationId: string) => {
    setIsDeleting(true);
    try {
      await deleteConversation(conversationId);
      setConversationToDelete(null);
      console.log('Conversation supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Empêcher la sélection de la conversation
    setConversationToDelete(conversationId);
  };

  const handleCancelDelete = () => {
    setConversationToDelete(null);
  };

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

  // Modal de confirmation de suppression
  const DeleteConfirmationModal = () => {
    if (!conversationToDelete) return null;

    const conversation = conversations.find(c => c.id === conversationToDelete);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Supprimer la conversation
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cette action est irréversible
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              Êtes-vous sûr de vouloir supprimer cette conversation ?
            </p>
            {conversation && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Conversation avec {conversation.participants?.length || 0} participant(s)</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Créée le {new Date(conversation.createdAt).toLocaleDateString()}
                </p>
                {conversation.lastMessage && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Dernier message : {conversation.lastMessage.content.substring(0, 50)}...
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleCancelDelete}
              variant="outline"
              className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              onClick={() => handleDeleteConversation(conversationToDelete)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Suppression...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Styles CSS pour les animations
  const customStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `;

  // Affichage temporaire pour test
  return (
    <>
      <style>{customStyles}</style>
      <DeleteConfirmationModal />
      <div className="p-4 space-y-4">
        {/* Barre d'outils de sélection multiple */}
        {isMultiSelectMode && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onSelectAll}
                  className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                  {selectedConversations.size === conversations.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {selectedConversations.size === conversations.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </span>
                </button>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedConversations.size} conversation(s) sélectionnée(s)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={onDeleteSelected}
                  disabled={selectedConversations.size === 0 || isDeletingMultiple}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                >
                  {isDeletingMultiple ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Suppression...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer ({selectedConversations.size})</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={onToggleMultiSelect}
                  variant="outline"
                  className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 text-sm px-3 py-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

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
        {onToggleMultiSelect && (
          <Button 
            onClick={onToggleMultiSelect}
            className={`${isMultiSelectMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
          >
            {isMultiSelectMode ? 'Annuler' : 'Sélectionner'}
          </Button>
        )}
      </div>

      {/* Titre de la section */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">💬 Messagerie</h2>
        <p className="text-sm text-gray-600 mb-2">Gérez vos conversations et échangez avec d'autres utilisateurs</p>
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Rafraîchissement automatique (2 min)</span>
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
              className={`p-3 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 transform hover:scale-[1.02] border-2 border-transparent group ${
                isMultiSelectMode ? 'cursor-default' : 'cursor-pointer'
              } ${selectedConversations.has(conversation.id) ? 'bg-blue-100 border-blue-300' : ''}`}
              onClick={() => {
                if (isMultiSelectMode) {
                  onSelectConversation?.(conversation.id);
                } else {
                  onConversationSelect(conversation);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-center space-x-3">
                  {/* Case à cocher en mode sélection multiple */}
                  {isMultiSelectMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectConversation?.(conversation.id);
                      }}
                      className="flex-shrink-0"
                    >
                      {selectedConversations.has(conversation.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                      )}
                    </button>
                  )}
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
                    {/* Bouton de suppression - visible au survol et seulement en mode normal */}
                    {!isMultiSelectMode && (
                      <button
                        onClick={(e) => handleDeleteClick(e, conversation.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        title="Supprimer la conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
    </>
  );
};

export default ConversationList;
