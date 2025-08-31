import { useEffect, useRef } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export const useRealtimeMessages = () => {
  const { user } = useAuthStore();
  const { 
    fetchConversations, 
    updateUnreadCount,
    setCurrentConversation,
    currentConversation 
  } = useMessageStore();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // Abonnement aux nouveaux messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Nouveau message reçu:', payload);
          
          // Mettre à jour le compteur de messages non lus
          updateUnreadCount();
          
          // Si on est dans une conversation, rafraîchir les messages
          if (currentConversation) {
            // Vérifier si le message appartient à la conversation actuelle
            if (payload.new.conversation_id === currentConversation.id) {
              // Rafraîchir les messages de la conversation actuelle
              useMessageStore.getState().fetchMessages(currentConversation.id);
            }
          }
          
          // Rafraîchir la liste des conversations
          fetchConversations();
          
          // Notification push (si supportée)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nouveau message', {
              body: payload.new.content,
              icon: '/favicon.ico',
              tag: 'new-message'
            });
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Message mis à jour:', payload);
          
          // Mettre à jour le compteur de messages non lus
          updateUnreadCount();
          
          // Si on est dans une conversation, rafraîchir les messages
          if (currentConversation && payload.new.conversation_id === currentConversation.id) {
            useMessageStore.getState().fetchMessages(currentConversation.id);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    // Demander la permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user, currentConversation, fetchConversations, updateUnreadCount]);

  // Fonction pour demander la permission des notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Fonction pour envoyer une notification de test
  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test de notification', {
        body: 'Ceci est un test de notification',
        icon: '/favicon.ico'
      });
    }
  };

  return {
    requestNotificationPermission,
    sendTestNotification
  };
};
