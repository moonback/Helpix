import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, Gift, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

// Types pour les transactions
interface Transaction {
  id: number;
  type: 'sent' | 'received';
  amount: number;
  description: string;
  date: string;
  counterparty: string;
}

const WalletPage: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Données mockées pour la démonstration
  useEffect(() => {
    // Simuler le chargement des transactions
    setTimeout(() => {
      setTransactions([
        {
          id: 1,
          type: 'received',
          amount: 50,
          description: 'Aide au jardinage',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          counterparty: 'Marie D.',
        },
        {
          id: 2,
          type: 'sent',
          amount: 30,
          description: 'Cours de cuisine',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          counterparty: 'Pierre L.',
        },
        {
          id: 3,
          type: 'received',
          amount: 25,
          description: 'Aide informatique',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          counterparty: 'Sophie M.',
        },
        {
          id: 4,
          type: 'sent',
          amount: 40,
          description: 'Déménagement',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          counterparty: 'Jean P.',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getTotalEarned = () => {
    return transactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalSpent = () => {
    return transactions
      .filter(t => t.type === 'sent')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            Mon Wallet 💳
          </h1>
          <p className="text-primary-100">
            Gérez vos crédits d'entraide
          </p>
        </div>
      </motion.header>

      {/* Balance Card */}
      <div className="px-6 -mt-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-lg border-0">
            <div className="text-center p-6">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {user?.credits || 0} crédits
              </div>
              <p className="text-gray-600 mb-4">
                Solde actuel
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Gift size={16} />}
                >
                  Offrir des crédits
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Users size={16} />}
                >
                  Échanger
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-green-50 border-green-200">
              <div className="p-4 text-center">
                <TrendingUp className="text-green-600 mx-auto mb-2" size={24} />
                <div className="text-2xl font-bold text-green-700">
                  +{getTotalEarned()}
                </div>
                <div className="text-sm text-green-600">
                  Crédits gagnés
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-red-50 border-red-200">
              <div className="p-4 text-center">
                <TrendingDown className="text-red-600 mx-auto mb-2" size={24} />
                <div className="text-2xl font-bold text-red-700">
                  -{getTotalSpent()}
                </div>
                <div className="text-sm text-red-600">
                  Crédits dépensés
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-16 flex-col"
                icon={<Gift size={20} />}
              >
                <span className="text-sm">Offrir des crédits</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col"
                icon={<Users size={20} />}
              >
                <span className="text-sm">Demander de l'aide</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Transactions History */}
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Historique des transactions
              </h3>
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune transaction pour le moment
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'received' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'received' ? (
                          <TrendingUp size={20} />
                        ) : (
                          <TrendingDown size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.counterparty} • {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        transaction.type === 'received' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'received' ? '+' : '-'}{transaction.amount}
                      </span>
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletPage;
