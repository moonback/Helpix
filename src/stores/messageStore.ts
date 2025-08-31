import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Message, Conversation, MessageStore } from '@/types';

// Store Zustand pour la gestion des messages

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  unreadCount: 0,

  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Récupérer d'abord les conversations de l'utilisateur
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // Récupérer les participants pour chaque conversation
      const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .select('*')
        .in('conversation_id', conversations?.map(c => c.id) || []);

      if (partError) throw partError;

      // Filtrer les conversations où l'utilisateur est participant
      const userConversations = conversations?.filter(conv => 
        participants?.some(p => p.conversation_id === conv.id && p.user_id === user.id)
      ) || [];

      // Récupérer le dernier message pour chaque conversation
      const conversationsWithMessages = await Promise.all(
        userConversations.map(async (conv) => {
          if (!conv.id) return null;
          
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, timestamp, sender_id, type')
            .eq('conversation_id', conv.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Récupérer les participants de cette conversation
          const convParticipants = participants?.filter(p => p.conversation_id === conv.id) || [];
          
          return {
            id: conv.id,
            participants: convParticipants.map(p => p.user_id),
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              sender_id: lastMessage.sender_id,
              receiver_id: '', // Sera rempli plus tard si nécessaire
              content: lastMessage.content,
              type: lastMessage.type || 'text',
              timestamp: lastMessage.timestamp,
              isRead: false
            } : undefined,
            unreadCount: 0, // Sera mis à jour séparément
            createdAt: conv.created_at || new Date().toISOString(),
            updatedAt: conv.updated_at || new Date().toISOString()
          };
        })
      );

      // Filtrer les conversations null
      const validConversations = conversationsWithMessages.filter((conv): conv is NonNullable<typeof conv> => conv !== null);

      set({ conversations: validConversations, isLoading: false });
      
      // Mettre à jour le compteur de messages non lus
      get().updateUnreadCount();
    } catch (error: any) {
      console.error('Erreur lors de la récupération des conversations:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      set({ messages: messages || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  sendMessage: async (content: string, receiverId: string, type: 'text' | 'image' | 'file' = 'text', attachments: File[] = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Vérifier si une conversation existe déjà
      let conversationId = get().currentConversation?.id;
      
      if (!conversationId) {
        // Créer une nouvelle conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
        
        // Créer les participants dans la table conversation_participants
        const { error: partError } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: conversationId, user_id: user.id },
            { conversation_id: conversationId, user_id: receiverId }
          ]);
        
        if (partError) throw partError;
        
        // Mettre à jour l'état local
        const newConv: Conversation = {
          id: conversationId!, // Utiliser l'assertion non-null car on vient de l'assigner
          participants: [user.id, receiverId],
          lastMessage: undefined,
          unreadCount: 0,
          createdAt: newConversation.created_at,
          updatedAt: newConversation.updated_at
        };
        
        set(state => ({
          conversations: [newConv, ...state.conversations],
          currentConversation: newConv
        }));
      }

      // Vérifier que conversationId est défini avant de continuer
      if (!conversationId) {
        throw new Error('Impossible de créer ou récupérer une conversation');
      }

      // Créer le message
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        type,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      const { data: message, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Traiter les pièces jointes si présentes
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `attachments/${conversationId}/${fileName}`;
          
          // Upload du fichier
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, file);

          if (!uploadError) {
            // Créer l'enregistrement de la pièce jointe
            await supabase
              .from('attachments')
              .insert({
                message_id: message.id,
                file_name: file.name,
                file_url: filePath,
                file_type: file.type,
                file_size: file.size
              });
          }
        }
      }

      // Mettre à jour l'état local
      const newMessage: Message = {
        id: message.id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp,
        isRead: message.isRead,
        attachments: []
      };

      set(state => ({
        messages: [...state.messages, newMessage],
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: newMessage, updatedAt: new Date().toISOString() }
            : conv
        )
      }));

      // Marquer comme lu pour l'expéditeur
      await get().markAsRead(message.id);
      
      // Mettre à jour l'état local sans rafraîchir automatiquement
      // Le rafraîchissement se fait via l'intervalle dans ConversationList
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ isRead: true })
        .eq('id', messageId);

      if (error) throw error;

      // Mettre à jour l'état local
      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      }));

      // Mettre à jour le compteur de messages non lus
      get().updateUnreadCount();
      
      // Pas de rafraîchissement automatique pour éviter les boucles
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createConversation: async (participantIds: string[]) => {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (error) throw error;

      // Créer les participants dans la table conversation_participants
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(
          participantIds.map(userId => ({
            conversation_id: conversation.id,
            user_id: userId
          }))
        );
      
      if (partError) throw partError;

      const newConversation: Conversation = {
        id: conversation.id,
        participants: participantIds,
        lastMessage: undefined,
        unreadCount: 0,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at
      };

      set(state => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation
      }));
      
      // Pas de rafraîchissement automatique pour éviter les boucles
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteConversation: async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      set(state => ({
        conversations: state.conversations.filter(conv => conv.id !== conversationId),
        currentConversation: state.currentConversation?.id === conversationId ? null : state.currentConversation,
        messages: state.currentConversation?.id === conversationId ? [] : state.messages
      }));
      
      // Pas de rafraîchissement automatique pour éviter les boucles
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
    if (conversation) {
      get().fetchMessages(conversation.id);
    } else {
      set({ messages: [] });
    }
  },

  updateUnreadCount: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: unreadMessages, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('isRead', false);

      if (!error) {
        set({ unreadCount: unreadMessages?.length || 0 });
      }
    } catch (error) {
      // Ignorer les erreurs pour cette fonction
    }
  }
}));
