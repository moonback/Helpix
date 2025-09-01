// Types pour le système de Wallet

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: 'credit' | 'debit' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  reference_type: 'task_completion' | 'help_offer' | 'withdrawal' | 'bonus' | 'refund';
  reference_id?: string; // ID de la tâche ou offre d'aide
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  processed_at?: string;
  metadata?: {
    task_title?: string;
    task_id?: number;
    help_offer_id?: string;
    payment_method?: string;
    bank_account?: string;
  };
}

export interface CreditEarning {
  id: string;
  user_id: string;
  task_id: number;
  help_offer_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
  paid_at?: string;
  task_title: string;
  task_owner: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  payment_method: 'bank_transfer' | 'paypal' | 'crypto';
  account_details: {
    bank_name?: string;
    account_number?: string;
    iban?: string;
    paypal_email?: string;
    crypto_address?: string;
  };
  created_at: string;
  processed_at?: string;
  rejection_reason?: string;
}

export interface WalletStats {
  total_balance: number;
  monthly_earnings: number;
  pending_earnings: number;
  total_transactions: number;
  average_earning_per_task: number;
  top_earning_categories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  recent_activity: Transaction[];
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'bank_transfer' | 'paypal' | 'crypto';
  is_default: boolean;
  details: {
    bank_name?: string;
    account_number?: string;
    iban?: string;
    paypal_email?: string;
    crypto_address?: string;
  };
  created_at: string;
  verified: boolean;
}

// Types pour les filtres et tri
export interface TransactionFilter {
  type?: Transaction['type'][];
  status?: Transaction['status'][];
  date_range?: {
    start: string;
    end: string;
  };
  amount_range?: {
    min: number;
    max: number;
  };
}

export interface TransactionSort {
  field: 'created_at' | 'amount' | 'type' | 'status';
  direction: 'asc' | 'desc';
}
