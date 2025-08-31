import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Video, MoreVertical } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

interface Message {
  id: number;
  content: string;
  sender_id: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Données mockées pour la démonstration
  useEffect(() => {
    // Simuler un utilisateur de chat
    setChatUser({
      id: userId || '1',
      name: 'Marie Dupont',
      avatar: '👩‍💼',
      online: true,
    });

    // Simuler des messages
    setMessages([
      {
        id: 1,
        content: 'Bonjour ! J\'ai vu votre demande d\'aide pour le jardinage',
        sender_id: userId || '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isOwn: false,
      },
      {
        id: 2,
        content: 'Bonjour Marie ! Oui, j\'aurais vraiment besoin d\'aide',
        sender_id: user?.id || '2',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        isOwn: true,
      },
      {
        id: 3,
        content: 'Je peux vous aider samedi matin si ça vous convient ?',
        sender_id: userId || '1',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        isOwn: false,
      },
      {
        id: 4,
        content: 'Parfait ! Samedi matin à 9h ça vous va ?',
        sender_id: user?.id || '2',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isOwn: true,
      },
      {
        id: 5,
        content: 'Oui parfait ! Je serai là à 9h. À bientôt !',
        sender_id: userId || '1',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        isOwn: false,
      },
    ]);
  }, [userId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      content: message.trim(),
      sender_id: user?.id || '2',
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simuler une réponse après 2 secondes
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        content: 'Message reçu ! Je vous réponds dans quelques instants.',
        sender_id: userId || '1',
        timestamp: new Date().toISOString(),
        isOwn: false,
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 24) {
      return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!chatUser) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={20} />}
          />
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-xl">
              {chatUser.avatar}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{chatUser.name}</h2>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${chatUser.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-500">
                  {chatUser.online ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Phone size={18} />} />
            <Button variant="ghost" size="sm" icon={<Video size={18} />} />
            <Button variant="ghost" size="sm" icon={<MoreVertical size={18} />} />
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.isOwn
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div className={`text-xs mt-1 ${
                msg.isOwn ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-t border-gray-200 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="lg"
            className="w-12 h-12 rounded-full p-0"
            icon={<Send size={20} />}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;
