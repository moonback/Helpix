import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { 
  Wallet, 
  Transaction, 
  CreditEarning, 
  WithdrawalRequest, 
  WalletStats,
  PaymentMethod,
  TransactionFilter,
  TransactionSort
} from '../types/wallet';

interface WalletStore {
  // État
  wallet: Wallet | null;
  transactions: Transaction[];
  creditEarnings: CreditEarning[];
  withdrawalRequests: WithdrawalRequest[];
  paymentMethods: PaymentMethod[];
  stats: WalletStats | null;
  isLoading: boolean;
  error: string | null;

  // Filtres et tri
  transactionFilters: TransactionFilter;
  transactionSort: TransactionSort;

  // Actions principales
  fetchWallet: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchCreditEarnings: () => Promise<void>;
  fetchWithdrawalRequests: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchWalletStats: () => Promise<void>;

  // Actions de transaction
  createTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  processCreditEarning: (earningId: string) => Promise<void>;
  requestWithdrawal: (request: Omit<WithdrawalRequest, 'id' | 'created_at'>) => Promise<void>;

  // Actions de filtrage
  setTransactionFilters: (filters: TransactionFilter) => void;
  setTransactionSort: (sort: TransactionSort) => void;
  filterTransactions: (filters: TransactionFilter) => Transaction[];
  sortTransactions: (transactions: Transaction[], sort: TransactionSort) => Transaction[];

  // Actions utilitaires
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'created_at'>) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;

  // Actions de mise à jour
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // État initial
  wallet: null,
  transactions: [],
  creditEarnings: [],
  withdrawalRequests: [],
  paymentMethods: [],
  stats: null,
  isLoading: false,
  error: null,

  // Filtres et tri
  transactionFilters: {},
  transactionSort: { field: 'created_at', direction: 'desc' },

  // Actions principales
  fetchWallet: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Créer un wallet s'il n'existe pas
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance: 0,
            total_earned: 0,
            total_spent: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        set({ wallet: newWallet });
      } else {
        set({ wallet: data });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du wallet:', error);
      set({ error: 'Erreur lors de la récupération du wallet' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Récupérer le wallet de l'utilisateur d'abord
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!wallet) {
        set({ transactions: [] });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ transactions: data || [] });
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      set({ error: 'Erreur lors de la récupération des transactions' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCreditEarnings: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Récupérer les transactions de crédit depuis la table transactions (exclure les dépôts)
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          wallet:wallet_id(user_id)
        `)
        .eq('wallet.user_id', user.id)
        .eq('type', 'credit')
        .neq('reference_type', 'rental_deposit') // Exclure les dépôts
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformer les données pour correspondre au format attendu
      const creditEarnings = data?.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        created_at: transaction.created_at,
        description: transaction.description,
        reference_type: transaction.reference_type,
        reference_id: transaction.reference_id
      })) || [];

      set({ creditEarnings });
    } catch (error) {
      console.error('Erreur lors de la récupération des gains:', error);
      set({ error: 'Erreur lors de la récupération des gains' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWithdrawalRequests: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Récupérer les transactions de retrait depuis la table transactions
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          wallet:wallet_id(user_id)
        `)
        .eq('wallet.user_id', user.id)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformer les données pour correspondre au format attendu
      const withdrawalRequests = data?.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        created_at: transaction.created_at,
        description: transaction.description,
        reference_type: transaction.reference_type,
        reference_id: transaction.reference_id
      })) || [];

      set({ withdrawalRequests });
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes de retrait:', error);
      set({ error: 'Erreur lors de la récupération des demandes de retrait' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPaymentMethods: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Pour l'instant, retourner un tableau vide car la table payment_methods n'existe pas
      // Cette fonctionnalité peut être implémentée plus tard
      set({ paymentMethods: [] });
    } catch (error) {
      console.error('Erreur lors de la récupération des méthodes de paiement:', error);
      set({ error: 'Erreur lors de la récupération des méthodes de paiement' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWalletStats: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Récupérer les statistiques du wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id, balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single();

      if (!walletData) {
        set({ stats: null });
        return;
      }

      // Récupérer les transactions récentes
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculer les gains mensuels (exclure les dépôts)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyEarnings } = await supabase
        .from('transactions')
        .select('amount, reference_type')
        .eq('wallet_id', walletData.id)
        .eq('type', 'credit')
        .neq('reference_type', 'rental_deposit') // Exclure les dépôts
        .gte('created_at', startOfMonth.toISOString());

      const monthlyEarningsTotal = monthlyEarnings?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Récupérer les gains en attente (transactions de crédit en attente, exclure les dépôts)
      const { data: pendingEarnings } = await supabase
        .from('transactions')
        .select(`
          amount,
          reference_type,
          wallet:wallet_id(user_id)
        `)
        .eq('wallet.user_id', user.id)
        .eq('type', 'credit')
        .neq('reference_type', 'rental_deposit') // Exclure les dépôts
        .eq('status', 'pending');

      const pendingEarningsTotal = pendingEarnings?.reduce((sum, e) => sum + e.amount, 0) || 0;

      const stats: WalletStats = {
        total_balance: walletData?.balance || 0,
        monthly_earnings: monthlyEarningsTotal,
        pending_earnings: pendingEarningsTotal,
        total_transactions: recentTransactions?.length || 0,
        average_earning_per_task: 0, // À calculer
        top_earning_categories: [], // À implémenter
        recent_activity: recentTransactions || []
      };

      set({ stats });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      set({ error: 'Erreur lors de la récupération des statistiques' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Actions de transaction
  createTransaction: async (transactionData) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Récupérer le wallet de l'utilisateur
      const { data: userWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userWallet) throw new Error('Wallet non trouvé');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          wallet_id: userWallet.id
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le wallet
      const { wallet } = get();
      if (wallet) {
        const newBalance = transactionData.type === 'credit' 
          ? wallet.balance + transactionData.amount
          : wallet.balance - transactionData.amount;

        const { error: updateError } = await supabase
          .from('wallets')
          .update({
            balance: newBalance,
            total_earned: transactionData.type === 'credit' 
              ? wallet.total_earned + transactionData.amount
              : wallet.total_earned,
            total_spent: transactionData.type === 'debit' 
              ? wallet.total_spent + transactionData.amount
              : wallet.total_spent
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Mettre à jour l'état local
        set({
          wallet: {
            ...wallet,
            balance: newBalance,
            total_earned: transactionData.type === 'credit' 
              ? wallet.total_earned + transactionData.amount
              : wallet.total_earned,
            total_spent: transactionData.type === 'debit' 
              ? wallet.total_spent + transactionData.amount
              : wallet.total_spent
          },
          transactions: [data, ...get().transactions]
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      set({ error: 'Erreur lors de la création de la transaction' });
    } finally {
      set({ isLoading: false });
    }
  },

  processCreditEarning: async (earningId) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('credit_earnings')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', earningId)
        .select()
        .single();

      if (error) throw error;

      // Créer une transaction de crédit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: userWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userWallet) throw new Error('Wallet non trouvé');

      await get().createTransaction({
        wallet_id: userWallet.id,
        type: 'credit',
        amount: data.amount,
        description: `Gain pour l'aide apportée à la tâche: ${data.task_title}`,
        reference_type: 'help_offer',
        reference_id: data.help_offer_id,
        status: 'completed',
        metadata: {
          task_title: data.task_title,
          task_id: data.task_id,
          help_offer_id: data.help_offer_id
        }
      });

      // Mettre à jour la liste des gains
      set({
        creditEarnings: get().creditEarnings.map(earning =>
          earning.id === earningId ? { ...earning, status: 'paid', paid_at: new Date().toISOString() } : earning
        )
      });
    } catch (error) {
      console.error('Erreur lors du traitement du gain:', error);
      set({ error: 'Erreur lors du traitement du gain' });
    } finally {
      set({ isLoading: false });
    }
  },

  requestWithdrawal: async (requestData) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          ...requestData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      set({
        withdrawalRequests: [data, ...get().withdrawalRequests]
      });
    } catch (error) {
      console.error('Erreur lors de la demande de retrait:', error);
      set({ error: 'Erreur lors de la demande de retrait' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Actions de filtrage
  setTransactionFilters: (filters) => {
    set({ transactionFilters: filters });
  },

  setTransactionSort: (sort) => {
    set({ transactionSort: sort });
  },

  filterTransactions: (filters) => {
    const { transactions } = get();
    return transactions.filter(transaction => {
      if (filters.type && !filters.type.includes(transaction.type)) return false;
      if (filters.status && !filters.status.includes(transaction.status)) return false;
      if (filters.date_range) {
        const transactionDate = new Date(transaction.created_at);
        const startDate = new Date(filters.date_range.start);
        const endDate = new Date(filters.date_range.end);
        if (transactionDate < startDate || transactionDate > endDate) return false;
      }
      if (filters.amount_range) {
        if (transaction.amount < filters.amount_range.min || transaction.amount > filters.amount_range.max) return false;
      }
      return true;
    });
  },

  sortTransactions: (transactions, sort) => {
    return [...transactions].sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  },

  // Actions utilitaires
  addPaymentMethod: async (methodData) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          ...methodData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      set({
        paymentMethods: [...get().paymentMethods, data]
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
      set({ error: 'Erreur lors de l\'ajout de la méthode de paiement' });
    } finally {
      set({ isLoading: false });
    }
  },

  removePaymentMethod: async (methodId) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;

      set({
        paymentMethods: get().paymentMethods.filter(method => method.id !== methodId)
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la méthode de paiement:', error);
      set({ error: 'Erreur lors de la suppression de la méthode de paiement' });
    } finally {
      set({ isLoading: false });
    }
  },

  setDefaultPaymentMethod: async (methodId) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Désactiver toutes les méthodes par défaut
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Activer la nouvelle méthode par défaut
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId);

      if (error) throw error;

      // Mettre à jour l'état local
      set({
        paymentMethods: get().paymentMethods.map(method => ({
          ...method,
          is_default: method.id === methodId
        }))
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la méthode par défaut:', error);
      set({ error: 'Erreur lors de la mise à jour de la méthode par défaut' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Actions de mise à jour
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));
