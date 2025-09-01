import { supabase } from './supabase';

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
 * Vérifie si un utilisateur a déjà été crédité pour une tâche
 * @param taskId - ID de la tâche
 * @returns true si l'utilisateur a déjà été crédité
 */
export const hasUserBeenCreditedForTask = async (taskId: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference_type', 'task_completion')
      .eq('reference_id', taskId.toString())
      .eq('type', 'credit')
      .limit(1);

    if (error) {
      console.error('Erreur lors de la vérification du crédit:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification du crédit:', error);
    return false;
  }
};
