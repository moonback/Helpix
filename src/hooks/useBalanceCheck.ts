import { useState, useCallback } from 'react';
import { useWalletStore } from '@/features/wallet/stores/walletStore';

export const useBalanceCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { wallet, fetchWallet } = useWalletStore();

  const checkBalance = useCallback(async (requiredCredits: number): Promise<boolean> => {
    setIsChecking(true);
    
    try {
      // S'assurer que le wallet est à jour
      await fetchWallet();
      
      if (!wallet) {
        console.error('Wallet non disponible');
        return false;
      }

      const hasEnoughCredits = wallet.balance >= requiredCredits;
      
      if (!hasEnoughCredits) {
        console.warn(`Solde insuffisant: ${wallet.balance} crédits disponibles, ${requiredCredits} requis`);
      }

      return hasEnoughCredits;
    } catch (error) {
      console.error('Erreur lors de la vérification du solde:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [wallet, fetchWallet]);

  const getBalanceInfo = useCallback(() => {
    if (!wallet) {
      return {
        balance: 0,
        hasWallet: false
      };
    }

    return {
      balance: wallet.balance,
      hasWallet: true
    };
  }, [wallet]);

  const canAffordTask = useCallback((requiredCredits: number): boolean => {
    if (!wallet) return false;
    return wallet.balance >= requiredCredits;
  }, [wallet]);

  return {
    checkBalance,
    getBalanceInfo,
    canAffordTask,
    isChecking,
    wallet
  };
};
