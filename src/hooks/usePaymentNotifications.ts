import { useState, useCallback } from 'react';

interface PaymentNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export const usePaymentNotifications = () => {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);

  const addNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: PaymentNotification = {
      id,
      type,
      title,
      message,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Fonctions utilitaires pour les types de notifications courants
  const notifyPaymentSuccess = useCallback((amount: number, taskTitle: string) => {
    addNotification(
      'success',
      'Paiement traité avec succès',
      `${amount} crédits ont été transférés pour la tâche "${taskTitle}"`
    );
  }, [addNotification]);

  const notifyPaymentError = useCallback((error: string) => {
    addNotification(
      'error',
      'Erreur de paiement',
      error
    );
  }, [addNotification]);

  const notifyInsufficientBalance = useCallback((required: number, current: number) => {
    addNotification(
      'warning',
      'Solde insuffisant',
      `Vous avez ${current} crédits mais ${required} sont requis pour cette tâche`
    );
  }, [addNotification]);

  const notifyTaskCompleted = useCallback((taskTitle: string, amount: number) => {
    addNotification(
      'info',
      'Tâche terminée',
      `Vous avez gagné ${amount} crédits pour avoir aidé sur "${taskTitle}"`
    );
  }, [addNotification]);

  const notifyTaskPayment = useCallback((taskTitle: string, amount: number) => {
    addNotification(
      'info',
      'Paiement effectué',
      `${amount} crédits ont été débités pour la tâche "${taskTitle}"`
    );
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    notifyPaymentSuccess,
    notifyPaymentError,
    notifyInsufficientBalance,
    notifyTaskCompleted,
    notifyTaskPayment
  };
};
