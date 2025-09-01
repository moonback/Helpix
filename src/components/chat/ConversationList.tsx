import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { 
  Trash2, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  Search,
  MessageSquare,
  Users,
  Pin,
  Archive,
  MoreVertical,
  Star,
  Volume2,
  VolumeX,
  Filter,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye
} from 'lucide-react';

interface ConversationListProps {
  onConversationSelect: (conversation: any) => void;
  isMultiSelectMode?: boolean;
  selectedConversations?: Set<string>;
  onSelectConversation?: (conversationId: string) => void;
  onToggleMultiSelect?: () => void;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  isDeletingMultiple?: boolean;
}

type SortOption = 'recent' | 'alphabetical' | 'unread';
type FilterOption = 'all' | 'unread' | 'favorites' | 'archived';

const ConversationList: React.FC<ConversationListProps> = ({ 
  onConversationSelect,
  isMultiSelectMode = false,
  selectedConversations = new Set(),
  onSelectConversation,
  onToggleMultiSelect,
  onSelectAll,
  onDeleteSelected,
  isDeletingMultiple = false
}) => {
  const { 
    conversations, 
    isLoading, 
    error, 
    fetchConversations, 
    deleteConversation,
    markConversationAsRead,
    toggleConversationFavorite,
    archiveConversation
  } = useMessageStore();
  const { user } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());


  // Gestion de l'état de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchConversations();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchConversations]);

  // Chargement et rafraîchissement des conversations
  useEffect(() => {
    fetchConversations();
    
    const interval = setInterval(() => {
      if (!document.hidden && isOnline) {
        fetchConversations();
        setLastUpdate(new Date());
      }
    }, 60000); // Rafraîchir toutes les minutes
    
    const handleVisibilityChange = () => {
      if (!document.hidden && isOnline) {
        fetchConversations();
        setLastUpdate(new Date());
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchConversations, isOnline]);

  // Fermer les menus contextuels
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.conv-modal-content') && !target.closest('.context-menu-trigger')) {
        setShowContextMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Forcer le body à n’avoir aucun scroll pendant l’ouverture du modal pour éviter un décalage et bloquer le fond.
  useEffect(() => {
    if (showContextMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showContextMenu]);

  // Filtrage et tri des conversations
  const filteredAndSortedConversations = useMemo(() => {
    let filtered = conversations.filter(conv => {
      // Recherche textuelle
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesParticipants = conv.participants?.some(p => 
          p.toLowerCase().includes(searchLower)
        );
        const matchesLastMessage = conv.lastMessage?.content
          .toLowerCase()
          .includes(searchLower);
        if (!matchesParticipants && !matchesLastMessage) return false;
      }

      // Filtrage par catégorie
      switch (filterOption) {
        case 'unread':
          return conv.unreadCount > 0;
        case 'favorites':
          return conv.isFavorite;
        case 'archived':
          return conv.isArchived;
        case 'all':
        default:
          return !conv.isArchived; // Masquer les archives par défaut
      }
    });

    // Tri
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'alphabetical':
          const nameA = `Conversation ${a.id}`;
          const nameB = `Conversation ${b.id}`;
          return nameA.localeCompare(nameB);
        case 'unread':
          return b.unreadCount - a.unreadCount;
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [conversations, searchTerm, sortOption, filterOption]);

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    setIsDeleting(true);
    try {
      await deleteConversation(conversationId);
      setConversationToDelete(null);
      setShowContextMenu(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConversation]);

  const handleContextMenuAction = useCallback(async (action: string, conversationId: string) => {
    try {
      switch (action) {
        case 'markAsRead':
          await markConversationAsRead(conversationId);
          break;
        case 'favorite':
          await toggleConversationFavorite(conversationId);
          break;
        case 'archive':
          await archiveConversation(conversationId);
          break;
        case 'delete':
          setConversationToDelete(conversationId);
          break;
      }
      setShowContextMenu(null);
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    }
  }, [markConversationAsRead, toggleConversationFavorite, archiveConversation]);

  const handleRefresh = useCallback(() => {
    fetchConversations();
    setLastUpdate(new Date());
  }, [fetchConversations]);

  const getConversationName = (conversation: any) => {
    if (conversation.name) return conversation.name;
    const otherParticipants = conversation.participants?.filter((p: string) => p !== user?.id) || [];
    if (otherParticipants.length === 1) {
      return `${otherParticipants[0].slice(0, 8)}...`;
    }
    return `Groupe (${conversation.participants?.length || 0})`;
  };

  const getConversationAvatar = (conversation: any) => {
    const name = getConversationName(conversation);
    const isGroup = conversation.participants?.length > 2;
    
    if (isGroup) {
      return (
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    return (
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
        <span className="text-white font-bold text-lg">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  const formatLastSeen = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${Math.floor(diffInHours)}h`;
    if (diffInHours < 168) return messageDate.toLocaleDateString('fr-FR', { weekday: 'short' });
    return messageDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Styles CSS améliorés
  const customStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    .animate-slideInRight { animation: slideInRight 0.2s ease-out; }
    .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
    .animate-shimmer { animation: shimmer 1.5s ease-in-out infinite; }
    
    .glass-effect {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .dark .glass-effect {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .conversation-item {
      position: relative;
      transition: all 0.2s ease;
      overflow: hidden;
    }
    
    .conversation-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .conversation-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    .conversation-item:hover::before {
      left: 100%;
    }
    
    .context-menu {
      animation: fadeIn 0.15s ease-out;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .status-dot {
      animation: pulse 2s ease-in-out infinite;
    }
  `;

  // Modal de confirmation de suppression
  const DeleteConfirmationModal = () => {
    if (!conversationToDelete) return null;
    const conversation = conversations.find(c => c.id === conversationToDelete);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass-effect rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Supprimer la conversation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Cette action est définitive
              </p>
            </div>
          </div>

          {conversation && (
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                {getConversationAvatar(conversation)}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {getConversationName(conversation)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {conversation.participants?.length || 0} participant(s)
                  </p>
                </div>
              </div>
              {conversation.lastMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{conversation.lastMessage.content.substring(0, 60)}..."
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={() => setConversationToDelete(null)}
              variant="outline"
              className="flex-1 border-gray-300 dark:border-gray-600"
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
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Suppression...</span>
                </div>
              ) : (
                'Supprimer'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-bold text-red-800 dark:text-red-300 text-lg mb-2">
              Erreur de connexion
            </h3>
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>
            <Button 
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <DeleteConfirmationModal />
      
      <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
        
        {/* Header avec état de connexion */}
        <div className="glass-effect border-b border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold gradient-text">Messages</h2>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full status-dot"></div>
                    <Wifi className="w-4 h-4 text-green-500" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <WifiOff className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
            </div>
            
      <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-white/20 dark:hover:bg-slate-700/50 rounded-xl"
                disabled={isLoading}
                title="Actualiser"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-white/20 dark:hover:bg-slate-700/50 rounded-xl"
                title="Filtres et tri"
              >
                <Filter className="w-5 h-5" />
              </Button>
              
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Rechercher des conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/50 dark:bg-slate-800/50 border-white/30 dark:border-slate-600/30 rounded-xl backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filtres et tri */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm animate-fadeIn">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer :</span>
                  <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value as FilterOption)}
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
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
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
          
          {/* Dernière mise à jour */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{filteredAndSortedConversations.length} conversation(s)</span>
            <span>Mise à jour : {lastUpdate.toLocaleTimeString('fr-FR', { timeStyle: 'short' })}</span>
          </div>
        </div>

        {/* Barre d'outils multi-sélection */}
        {isMultiSelectMode && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 animate-slideInRight">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onSelectAll}
                  className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-medium"
                >
                  {selectedConversations.size === filteredAndSortedConversations.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span className="text-sm">
                    {selectedConversations.size === filteredAndSortedConversations.length 
                      ? 'Tout désélectionner' 
                      : 'Tout sélectionner'
                    }
                  </span>
                </button>
                <div className="h-4 w-px bg-blue-300"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {selectedConversations.size} sélectionnée(s)
                      </span>
                    </div>
              
              <div className="flex items-center space-x-2">
        <Button 
                  onClick={onDeleteSelected}
                  disabled={selectedConversations.size === 0 || isDeletingMultiple}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl"
                >
                  {isDeletingMultiple ? (
            <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
                  size="sm"
                  className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 px-3 py-2 rounded-xl"
                >
                  Annuler
          </Button>
              </div>
            </div>
                </div>
        )}

        {/* Liste des conversations */}
        <div className="flex-1 overflow-hidden h-full">
          {filteredAndSortedConversations.length > 0 ? (
            <div className="p-4 space-y-2">
                              {filteredAndSortedConversations.slice(0, 8).map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item group p-4 rounded-2xl cursor-pointer transition-all ${
                    isMultiSelectMode 
                      ? 'cursor-default' 
                      : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
                  } ${
                    selectedConversations.has(conversation.id) 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700' 
                      : 'bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/30'
                  }`}
                  style={showContextMenu === conversation.id ? { transform: 'none' } : undefined}
                  
                  onClick={() => {
                    if (isMultiSelectMode) {
                      onSelectConversation?.(conversation.id);
                    } else {
                      onConversationSelect(conversation);
                    }
                  }}

                >
                  <div className="flex items-center space-x-4">
                    {/* Case à cocher en mode multi-sélection */}
                    {isMultiSelectMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectConversation?.(conversation.id);
                        }}
                        className="flex-shrink-0 p-1"
                      >
                        {selectedConversations.has(conversation.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                        )}
                      </button>
                    )}

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {getConversationAvatar(conversation)}
                      {conversation.isFavorite && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </div>
        )}
      </div>

                    {/* Contenu de la conversation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {getConversationName(conversation)}
                        </h3>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {conversation.isArchived && (
                            <Archive className="w-4 h-4 text-gray-400" />
                          )}
                          {conversation.isPinned && (
                            <Pin className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatLastSeen(conversation.updatedAt)}
                          </span>
        </div>
      </div>

          <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate pr-2">
                          {conversation.lastMessage ? (
                            <span className="flex items-center space-x-1">
                              {conversation.lastMessage.sender_id === user?.id && (
                                <span className="text-blue-500">Vous:</span>
                              )}
                              <span>{conversation.lastMessage.content}</span>
                            </span>
                          ) : (
                            <span className="italic text-gray-400">Aucun message</span>
                          )}
                        </p>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {conversation.isMuted && (
                            <VolumeX className="w-4 h-4 text-gray-400" />
                          )}
                          {!isMultiSelectMode && (
                            <div className="context-menu-trigger relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowContextMenu(
                                    showContextMenu === conversation.id ? null : conversation.id
                                  );
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>

                              {/* Menu en modal */}
                              {showContextMenu === conversation.id && (
                                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                                  <div className="conv-modal-content w-full sm:max-w-xs bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="py-2">
                                      {conversation.unreadCount > 0 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleContextMenuAction('markAsRead', conversation.id);
                                          }}
                                          className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 transition-colors"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span>Marquer comme lu</span>
                                        </button>
                                      )}

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleContextMenuAction('favorite', conversation.id);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 transition-colors"
                                      >
                                        <Star className={`w-4 h-4 ${conversation.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                                        <span>{conversation.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleContextMenuAction('mute', conversation.id);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 transition-colors"
                                      >
                                        {conversation.isMuted ? (
                                          <>
                                            <Volume2 className="w-4 h-4" />
                                            <span>Réactiver les notifications</span>
                                          </>
                                        ) : (
                                          <>
                                            <VolumeX className="w-4 h-4" />
                                            <span>Désactiver les notifications</span>
                                          </>
                                        )}
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleContextMenuAction('archive', conversation.id);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 transition-colors"
                                      >
                                        <Archive className="w-4 h-4" />
                                        <span>{conversation.isArchived ? 'Désarchiver' : 'Archiver'}</span>
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleContextMenuAction('delete', conversation.id);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Supprimer</span>
                                      </button>
          </div>
                                    <div className="border-t border-gray-200 dark:border-slate-600">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowContextMenu(null);
                                        }}
                                        className="w-full px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                      >
                                        Annuler
                                      </button>
                    </div>
                    </div>
                  </div>
                              )}
                    </div>
                  )}
                </div>
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
      ) : (
            /* État vide */
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse-slow">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold gradient-text">
                    {searchTerm ? 'Aucun résultat' : 'Pas encore de conversations'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {searchTerm 
                      ? `Aucune conversation ne correspond à "${searchTerm}"`
                      : 'Les nouvelles conversations se créent depuis les tâches'
                    }
                  </p>
                </div>
                
                {/* CTA création retiré */}
                
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    variant="outline"
                    className="px-6 py-2 rounded-xl"
                  >
                    Effacer la recherche
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Indicateur de chargement en bas */}
        {isLoading && conversations.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Actualisation...</span>
            </div>
          </div>
      )}
    </div>
    </>
  );
};

export default ConversationList;