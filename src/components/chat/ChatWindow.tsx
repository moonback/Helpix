import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import { Conversation, Message } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  File, 
  X,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Trash2,
  Edit3,
  Copy,
  Reply,
  Info,
  ArrowDown,
  Mic
} from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack: () => void;
}

// Styles CSS améliorés avec plus d'animations et d'effets
const customStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.3s ease-out forwards;
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out forwards;
  }

  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-10px); }
  }

  .typing-dot {
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes messageShine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .message-bubble {
    position: relative;
    overflow: visible;
    transition: all 0.3s ease;
    z-index: 40;
  }

  .message-bubble:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  .message-bubble::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.2),
      transparent
    );
    transition: left 0.5s;
  }

  .message-bubble:hover::before {
    left: 100%;
  }

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

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0, -30px, 0); }
    70% { transform: translate3d(0, -15px, 0); }
    90% { transform: translate3d(0, -4px, 0); }
  }

  .bounce-animation {
    animation: bounce 1s ease infinite;
  }

  .gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .message-actions {
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.2s ease;
  }

  .message-bubble:hover .message-actions {
    opacity: 1;
    transform: translateY(0);
  }

  .scroll-indicator {
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .scroll-indicator.visible {
    opacity: 1;
  }

  .input-container {
    position: relative;
    transition: all 0.3s ease;
  }

  .input-container:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .attachment-preview {
    animation: slideInUp 0.3s ease-out;
  }

  @keyframes slideInUp {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  
`;

// Modal générique pour les menus (portal vers body)
const MenuModal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => {
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="message-modal-content w-full sm:max-w-xs bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onBack
}) => {
  const { messages, isLoading, error, sendMessage, markAsRead, deleteMessage, editMessage } = useMessageStore();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);

  const [userNamesMap, setUserNamesMap] = useState<Record<string, string>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gestion du scroll pour afficher/masquer le bouton de retour en bas
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.message-modal-content') && !target.closest('.menu-trigger')) {
        setShowMessageMenu(null);
      }
      
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Lock scroll quand le modal est ouvert
  useEffect(() => {
    if (showMessageMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMessageMenu]);

  // Marquer les messages comme lus
  useEffect(() => {
    if (conversation && messages.length > 0) {
      messages.forEach(message => {
        if (message.receiver_id === user?.id && !message.isRead) {
          markAsRead(message.id);
        }
      });
    }
  }, [conversation, messages, user?.id, markAsRead]);

  // Charger le nom de l'autre participant
  useEffect(() => {
    const loadParticipantNames = async () => {
      try {
        if (!conversation) return;
        const ids = conversation.participants.filter(id => id && id !== user?.id && !userNamesMap[id]);
        if (ids.length === 0) return;
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .in('id', ids);
        if (error) throw error;
        const next: Record<string, string> = { ...userNamesMap };
        (data || []).forEach((u: { id: string; name: string }) => {
          next[u.id] = u.name || 'Utilisateur';
        });
        setUserNamesMap(next);
      } catch (e) {
        // Silent fallback
      }
    };
    loadParticipantNames();
  }, [conversation, user?.id, userNamesMap]);

  // Simulation de l'indicateur "en train d'écrire"
  const handleInputChange = useCallback((value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, [isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!conversation || (!newMessage.trim() && attachments.length === 0) || !user) return;

    const otherParticipantId = conversation.participants.find(id => id !== user.id);
    if (!otherParticipantId) {
      console.error('Impossible de trouver l\'autre participant');
      return;
    }

    try {
      await sendMessage(newMessage, otherParticipantId, 'text', attachments);
      setNewMessage('');
      setAttachments([]);
      setReplyTo(null);
      setIsTyping(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleSaveEdit();
      } else {
      handleSendMessage();
      }
    }
    if (e.key === 'Escape') {
      setEditingMessage(null);
      setReplyTo(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message.id);
    setEditText(message.content);
    setShowMessageMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editText.trim()) return;
    
    try {
      await editMessage(editingMessage, editText);
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Erreur lors de la modification du message:', error);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setShowMessageMenu(null);
    // Vous pourriez ajouter une notification toast ici
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyTo(message);
    setShowMessageMenu(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setShowMessageMenu(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }
  };

  const toggleMessageMenu = (messageId: string) => {
    setShowMessageMenu(showMessageMenu === messageId ? null : messageId);
  };

  

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    } else if (diffInHours < 168) { // 7 jours
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  const getReadStatus = (message: Message) => {
    if (message.sender_id !== user?.id) return null;
    
    if (message.isRead) {
      return <CheckCheck className="h-4 w-4 text-blue-400" />;
    }
    return <Check className="h-4 w-4 text-gray-400" />;
  };

  // Utilisation directe des messages sans filtrage
  const filteredMessages: Message[] = messages;

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold gradient-text mb-2">
              Commencez une conversation
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Sélectionnez une conversation pour commencer à discuter
            </p>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipantId = conversation.participants.find(id => id !== user?.id);
  const participantName = otherParticipantId
    ? (userNamesMap[otherParticipantId] || `Utilisateur ${otherParticipantId.slice(0, 8)}...`)
    : 'Utilisateur';

  return (
    <>
      <style>{customStyles}</style>
      <div className="relative h-full w-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-visible">
        
        {/* Header amélioré */}
        <div className="glass-effect border-b border-white/20 dark:border-slate-700/50">
          <div className="h-16 flex items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
              className="p-2 hover:bg-white/20 dark:hover:bg-slate-700/50 rounded-xl transition-all mr-3 hover:scale-105"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
          </Button>
          
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
              {participantName.charAt(0).toUpperCase()}
            </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>
          
            <div className="flex-1 ml-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {participantName}
            </h3>
              <div className="flex items-center space-x-2">
                {isTyping ? (
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full typing-dot"></div>
                    </div>
                    <span className="text-xs text-blue-500 ml-2">en train d'écrire...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">En ligne</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions du header */}
            <div className="flex items-center space-x-1">

              <Button
                variant="ghost"
                size="sm"
                className="p-3 hover:bg-white/20 dark:hover:bg-slate-700/50 rounded-xl transition-all hover:scale-105"
                title="Appel vocal"
              >
                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-3 hover:bg-white/20 dark:hover:bg-slate-700/50 rounded-xl transition-all hover:scale-105"
                title="Appel vidéo"
              >
                <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-3 hover:bg-white/20 dark:hover:bg-slate-700/50 rounded-xl transition-all hover:scale-105"
                title="Informations"
              >
                <Info className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
          </div>


        </div>

        {/* Zone de réponse */}
        {replyTo && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-700 animate-slideInUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Réponse à {replyTo.sender_id === user?.id ? 'vous' : participantName}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 truncate max-w-xs">
                    {replyTo.content}
            </p>
          </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
                className="text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
        </div>
      </div>
        )}

      {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="relative flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 pb-28 md:pb-44 space-y-5 md:space-y-6 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-slate-800/30 h-full"
        >
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
            <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
            <p>Erreur: {error}</p>
          </div>
          ) : filteredMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md mx-auto px-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center bounce-animation">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold gradient-text mb-3">
                    Nouvelle conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Envoyez votre premier message pour commencer cette conversation !
                  </p>
                </div>
              </div>
          </div>
        ) : (
            filteredMessages.map((message: Message, index: number) => {
            const isOwnMessage = message.sender_id === user?.id;
              const showAvatar = index === 0 || filteredMessages[index - 1]?.sender_id !== message.sender_id;
            return (
              <div
                key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Avatar pour les messages reçus */}
                  {!isOwnMessage && showAvatar && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center mr-3 mt-auto mb-2">
                      <span className="text-white font-medium text-xs">
                        {participantName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      !isOwnMessage && !showAvatar ? 'ml-11' : ''
                    }`}
                  >
                    {editingMessage === message.id ? (
                      /* Mode édition */
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          multiline
                          className="mb-3"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMessage(null)}
                          >
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="bg-blue-500 text-white"
                          >
                            Sauvegarder
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Message normal */
                      <div
                        className={`message-bubble group px-4 py-3 rounded-2xl shadow-lg ${
                    isOwnMessage
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-600'
                  }`}
                >
                  {/* Contenu du message */}
                  <div className="mb-2">
                    {message.type === 'image' && (
                            <div className="mb-2 relative group">
                        <img
                          src={message.content}
                          alt="Image"
                                className="rounded-xl max-w-full h-auto shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                                onClick={() => {/* Ouvrir en plein écran */}}
                        />
                      </div>
                    )}
                    
                    {message.type === 'file' && (
                            <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-xl">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                  <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">Fichier joint</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Document</p>
                                </div>
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'text' && (
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                  </div>

                        {/* Métadonnées et actions */}
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center space-x-2 text-xs ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                            {message.edited && (
                              <span className="italic opacity-75">(modifié)</span>
                            )}
                    {getReadStatus(message)}
                  </div>

                          {/* Actions du message */}
                          <div className="message-actions flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReplyToMessage(message)}
                              className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                                isOwnMessage 
                                  ? 'hover:bg-blue-400/30 text-blue-100' 
                                  : 'hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500'
                              }`}
                              title="Répondre"
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            
                            {isOwnMessage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditMessage(message)}
                                  className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-400/30 text-blue-100"
                                  title="Modifier"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                
                                <div className="relative menu-trigger">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleMessageMenu(message.id)}
                                    className="p-1 rounded-lg md:opacity-0 opacity-100 group-hover:opacity-100 focus:opacity-100 active:opacity-100 transition-opacity hover:bg-blue-400/30 text-blue-100"
                                    title="Plus d'options"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                  
                                  {/* Menu en modal (portal) */}
                                  {showMessageMenu === message.id && (
                                    <MenuModal onClose={() => setShowMessageMenu(null)}>
                                      <div className="py-2 animate-fadeInUp">
                                        <button
                                          onClick={() => handleCopyMessage(message.content)}
                                          className="w-full px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center space-x-2 transition-colors"
                                        >
                                          <Copy className="h-4 w-4" />
                                          <span>Copier</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteMessage(message.id)}
                                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span>Supprimer</span>
                                        </button>
                                      </div>
                                      <div className="border-t border-gray-200 dark:border-slate-600">
                                        <button
                                          onClick={() => setShowMessageMenu(null)}
                                          className="w-full px-4 py-3 text-center text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                          Annuler
                                        </button>
                                      </div>
                                    </MenuModal>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

        {/* Bouton de retour en bas */}
        {showScrollButton && (
          <div className="scroll-indicator visible">
            <Button
              onClick={scrollToBottom}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
              title="Aller au bas de la conversation"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Prévisualisation des pièces jointes */}
      {attachments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
            <div className="flex flex-wrap gap-3">
            {attachments.map((file, index) => (
              <div
                key={index}
                  className="attachment-preview flex items-center space-x-3 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow"
              >
                  <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {file.name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                >
                    <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

        {/* Zone de saisie améliorée */}
        <div className="sticky bottom-16 md:bottom-20 lg:bottom-16 z-[60] p-4 md:p-5 border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
          <div className="input-container glass-effect rounded-xl p-3 md:p-4">
            <div className="flex items-end space-x-2 md:space-x-3">
              {/* Boutons d'actions rapides */}
              <div className="flex space-x-1">
                <Button
                  onClick={() => imageInputRef.current?.click()}
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all hover:scale-110"
                  title="Ajouter une image"
                >
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-purple-50 dark:hover:bg-slate-700 rounded-xl transition-all hover:scale-110"
                  title="Joindre un fichier"
                >
                  <Paperclip className="h-5 w-5 text-purple-500" />
                </Button>
                
                
                
                <Button
                  onMouseDown={() => setIsRecording(true)}
                  onMouseUp={() => setIsRecording(false)}
                  onMouseLeave={() => setIsRecording(false)}
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-xl transition-all hover:scale-110 ${
                    isRecording 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                      : 'hover:bg-red-50 dark:hover:bg-slate-700 text-red-500'
                  }`}
                  title="Maintenir pour enregistrer un message vocal"
                >
                  <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
              
              {/* Champ de saisie */}
          <div className="flex-1">
            <Input
              value={newMessage}
                  onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              multiline
              rows={1}
                  className="min-h-[40px] max-h-32 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          
              {/* Bouton d'envoi */}
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && attachments.length === 0}
            size="sm"
                className={`px-4 py-2 rounded-xl transition-all transform hover:scale-105 ${
                  newMessage.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                }`}
          >
            <Send className="h-4 w-4" />
          </Button>
            </div>
          </div>
        </div>
        
        {/* Inputs cachés pour les fichiers */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        />
        
        <input
          ref={imageInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*"
        />
      </div>
    </>
  );
};

export default ChatWindow;
