import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { HelpOffer, HelpOfferNotification } from '@/types';

interface HelpOfferState {
  // État
  offers: HelpOffer[];
  notifications: HelpOfferNotification[];
  isLoading: boolean;
  error: string | null;
  
  // Actions pour les offres
  createHelpOffer: (taskId: number, message?: string, proposedDuration?: number, proposedCredits?: number) => Promise<void>;
  acceptHelpOffer: (offerId: string, responseMessage?: string) => Promise<void>;
  rejectHelpOffer: (offerId: string, responseMessage?: string) => Promise<void>;
  cancelHelpOffer: (offerId: string) => Promise<void>;
  fetchOffersForTask: (taskId: number) => Promise<void>;
  fetchUserOffers: (userId: string) => Promise<void>;
  
  // Actions pour les notifications
  fetchNotifications: (userId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: (userId: string) => Promise<void>;
  
  // Utilitaires
  clearError: () => void;
  getOffersByStatus: (status: HelpOffer['status']) => HelpOffer[];
  getUnreadNotificationsCount: () => number;
}

export const useHelpOfferStore = create<HelpOfferState>((set, get) => ({
  // État initial
  offers: [],
  notifications: [],
  isLoading: false,
  error: null,

  // Créer une offre d'aide
  createHelpOffer: async (taskId, message, proposedDuration, proposedCredits) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('help_offers')
        .insert({
          task_id: taskId,
          helper_id: user.id,
          message,
          proposed_duration: proposedDuration,
          proposed_credits: proposedCredits,
        })
        .select(`
          *,
          helper:helper_id(id, name, email, avatar_url),
          task:task_id(id, title, user_id)
        `)
        .single();

      if (error) throw error;

      set(state => ({
        offers: [...state.offers, data],
        isLoading: false
      }));

    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Accepter une offre d'aide
  acceptHelpOffer: async (offerId, responseMessage) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.rpc('accept_help_offer', {
        offer_id: offerId,
        response_msg: responseMessage
      });

      if (error) throw error;

      // Mettre à jour l'offre dans le store
      set(state => ({
        offers: state.offers.map(offer => 
          offer.id === offerId 
            ? { ...offer, status: 'accepted' as const, response_message: responseMessage }
            : offer
        ),
        isLoading: false
      }));

    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'offre:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Rejeter une offre d'aide
  rejectHelpOffer: async (offerId, responseMessage) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.rpc('reject_help_offer', {
        offer_id: offerId,
        response_msg: responseMessage
      });

      if (error) throw error;

      // Mettre à jour l'offre dans le store
      set(state => ({
        offers: state.offers.map(offer => 
          offer.id === offerId 
            ? { ...offer, status: 'rejected' as const, response_message: responseMessage }
            : offer
        ),
        isLoading: false
      }));

    } catch (error) {
      console.error('Erreur lors du rejet de l\'offre:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Annuler une offre d'aide
  cancelHelpOffer: async (offerId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('help_offers')
        .update({ status: 'cancelled' })
        .eq('id', offerId);

      if (error) throw error;

      // Mettre à jour l'offre dans le store
      set(state => ({
        offers: state.offers.map(offer => 
          offer.id === offerId 
            ? { ...offer, status: 'cancelled' as const }
            : offer
        ),
        isLoading: false
      }));

    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'offre:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Récupérer les offres pour une tâche
  fetchOffersForTask: async (taskId) => {
    set({ isLoading: true, error: null });
    
    try {
             const { data, error } = await supabase
         .from('help_offers')
         .select(`
           *,
           helper:helper_id(id, name, email, avatar_url),
           task:task_id(id, title, user_id)
         `)
         .eq('task_id', taskId)
         .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        offers: data || [],
        isLoading: false 
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Récupérer les offres d'un utilisateur
  fetchUserOffers: async (userId) => {
    set({ isLoading: true, error: null });
    
    try {
             const { data, error } = await supabase
         .from('help_offers')
         .select(`
           *,
           helper:helper_id(id, name, email, avatar_url),
           task:task_id(id, title, user_id, status)
         `)
         .eq('helper_id', userId)
         .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        offers: data || [],
        isLoading: false 
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des offres utilisateur:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isLoading: false 
      });
    }
  },

  // Récupérer les notifications
  fetchNotifications: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('help_offer_notifications')
        .select(`
          *,
          help_offer:help_offer_id(
            id,
            task_id,
            helper_id,
            status,
            message,
            task:task_id(id, title)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ notifications: data || [] });

    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      set({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    }
  },

  // Marquer une notification comme lue
  markNotificationAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('help_offer_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      }));

    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  },

  // Marquer toutes les notifications comme lues
  markAllNotificationsAsRead: async (userId) => {
    try {
      const { error } = await supabase
        .from('help_offer_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.user_id === userId
            ? { ...notification, is_read: true }
            : notification
        )
      }));

    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  },

  // Effacer l'erreur
  clearError: () => set({ error: null }),

  // Obtenir les offres par statut
  getOffersByStatus: (status) => {
    return get().offers.filter(offer => offer.status === status);
  },

  // Obtenir le nombre de notifications non lues
  getUnreadNotificationsCount: () => {
    return get().notifications.filter(notification => !notification.is_read).length;
  },
}));
