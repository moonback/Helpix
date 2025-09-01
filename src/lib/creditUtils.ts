import { supabase } from './supabase';

/**
 * Débite automatiquement le créateur de la tâche pour payer l'aide apportée
 * @param taskOwnerId - ID du propriétaire de la tâche
 * @param taskId - ID de la tâche
 * @param amount - Montant des crédits à débiter
 * @param taskTitle - Titre de la tâche
 * @param helperUserId - ID de l'utilisateur qui a aidé
 */
export const debitTaskOwnerForPayment = async (
  taskOwnerId: string,
  taskId: number,
  amount: number,
  taskTitle: string,
  helperUserId: string
): Promise<boolean> => {
  try {
    // Récupérer l'ID du wallet du propriétaire de la tâche
    const { data: ownerWallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance, total_spent')
      .eq('user_id', taskOwnerId)
      .single();

    if (walletError || !ownerWallet) {
      console.warn(`⚠️ Wallet non trouvé pour le propriétaire de la tâche ${taskOwnerId}:`, walletError);
      return false;
    }

    // Vérifier que le propriétaire a suffisamment de crédits
    if (ownerWallet.balance < amount) {
      console.error(`❌ Solde insuffisant pour le propriétaire de la tâche. Solde: ${ownerWallet.balance}, Montant requis: ${amount}`);
      return false;
    }

    // Créer la transaction de débit
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        wallet_id: ownerWallet.id,
        type: 'debit',
        amount: amount,
        description: `Paiement pour l'aide reçue sur la tâche: ${taskTitle}`,
        reference_type: 'task_completion',
        reference_id: taskId.toString(),
        status: 'completed',
        metadata: {
          task_title: taskTitle,
          task_id: taskId,
          helper_user_id: helperUserId
        }
      });

    if (transactionError) {
      console.error('Erreur lors de la création de la transaction de débit:', transactionError);
      return false;
    }

    // Mettre à jour le solde du wallet du propriétaire
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        balance: ownerWallet.balance - amount,
        total_spent: ownerWallet.total_spent + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', ownerWallet.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du solde du propriétaire:', updateError);
      return false;
    }

    console.log(`✅ ${amount} crédits débités du propriétaire ${taskOwnerId} pour la tâche "${taskTitle}"`);
    return true;

  } catch (error) {
    console.error('Erreur lors du débit automatique:', error);
    return false;
  }
};

/**
 * Crédite automatiquement un utilisateur pour l'aide apportée à une tâche
 * @param userId - ID de l'utilisateur à créditer
 * @param taskId - ID de la tâche
 * @param amount - Montant des crédits à accorder
 * @param taskTitle - Titre de la tâche
 * @param taskOwnerId - ID du propriétaire de la tâche
 */
export const creditUserForTaskCompletion = async (
  userId: string,
  taskId: number,
  amount: number,
  taskTitle: string,
  taskOwnerId: string
): Promise<boolean> => {
  try {
    // Récupérer l'ID du wallet de l'utilisateur
    const { data: userWallet, error: walletError } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (walletError || !userWallet) {
      console.warn(`⚠️ Wallet non trouvé pour l'utilisateur ${userId}:`, walletError);
      return false;
    }

    // Créer la transaction de crédit
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        wallet_id: userWallet.id,
        type: 'credit',
        amount: amount,
        description: `Gain pour l'aide apportée à la tâche: ${taskTitle}`,
        reference_type: 'task_completion',
        reference_id: taskId.toString(),
        status: 'completed',
        metadata: {
          task_title: taskTitle,
          task_id: taskId,
          task_owner: taskOwnerId
        }
      });

    if (transactionError) {
      console.error('Erreur lors de la création de la transaction:', transactionError);
      return false;
    }

    // Récupérer le wallet actuel pour calculer le nouveau solde
    const { data: currentWallet, error: fetchError } = await supabase
      .from('wallets')
      .select('balance, total_earned')
      .eq('id', userWallet.id)
      .single();

    if (fetchError || !currentWallet) {
      console.error('Erreur lors de la récupération du wallet:', fetchError);
      return false;
    }

    // Mettre à jour le solde du wallet
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        balance: currentWallet.balance + amount,
        total_earned: currentWallet.total_earned + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userWallet.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du solde:', updateError);
      return false;
    }

    console.log(`✅ ${amount} crédits accordés à l'utilisateur ${userId} pour la tâche "${taskTitle}"`);
    return true;

  } catch (error) {
    console.error('Erreur lors du crédit automatique:', error);
    return false;
  }
};

/**
 * Traite le paiement complet d'une tâche terminée (débit du créateur + crédit de l'aideur)
 * @param taskOwnerId - ID du propriétaire de la tâche
 * @param helperUserId - ID de l'utilisateur qui a aidé
 * @param taskId - ID de la tâche
 * @param amount - Montant des crédits à transférer
 * @param taskTitle - Titre de la tâche
 */
export const processTaskPayment = async (
  taskOwnerId: string,
  helperUserId: string,
  taskId: number,
  amount: number,
  taskTitle: string
): Promise<boolean> => {
  try {
    console.log(`🔄 Traitement du paiement pour la tâche "${taskTitle}" (${amount} crédits)`);
    
    // 1. Débiter le créateur de la tâche
    const debitSuccess = await debitTaskOwnerForPayment(
      taskOwnerId,
      taskId,
      amount,
      taskTitle,
      helperUserId
    );

    if (!debitSuccess) {
      console.error('❌ Échec du débit du propriétaire de la tâche');
      return false;
    }

    // 2. Créditer l'utilisateur qui a aidé
    const creditSuccess = await creditUserForTaskCompletion(
      helperUserId,
      taskId,
      amount,
      taskTitle,
      taskOwnerId
    );

    if (!creditSuccess) {
      console.error('❌ Échec du crédit de l\'utilisateur qui a aidé');
      // TODO: Implémenter un système de rollback si nécessaire
      return false;
    }

    console.log(`✅ Paiement traité avec succès pour la tâche "${taskTitle}"`);
    return true;

  } catch (error) {
    console.error('Erreur lors du traitement du paiement:', error);
    return false;
  }
};

/**
 * Vérifie si le paiement d'une tâche a déjà été traité
 * @param taskId - ID de la tâche
 * @returns true si le paiement a déjà été traité
 */
export const hasTaskPaymentBeenProcessed = async (taskId: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, type')
      .eq('reference_type', 'task_completion')
      .eq('reference_id', taskId.toString())
      .in('type', ['credit', 'debit']);

    if (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      return false;
    }

    // Vérifier qu'il y a à la fois un crédit ET un débit pour cette tâche
    const hasCredit = data.some(t => t.type === 'credit');
    const hasDebit = data.some(t => t.type === 'debit');
    
    return hasCredit && hasDebit;
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    return false;
  }
};

/**
 * Vérifie si un utilisateur a déjà été crédité pour une tâche (fonction legacy)
 * @param taskId - ID de la tâche
 * @returns true si l'utilisateur a déjà été crédité
 * @deprecated Utilisez hasTaskPaymentBeenProcessed à la place
 */
export const hasUserBeenCreditedForTask = async (taskId: number): Promise<boolean> => {
  return hasTaskPaymentBeenProcessed(taskId);
};
