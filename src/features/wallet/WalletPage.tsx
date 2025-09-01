import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWalletStore } from './stores/walletStore';

// Composants
import WalletHeader from './components/WalletHeader';
import BalanceCard from './components/BalanceCard';
import WalletStats from './components/WalletStats';
import TransactionList from './components/TransactionList';
import CreditEarnings from './components/CreditEarnings';
import WithdrawalForm from './components/WithdrawalForm';
import CreditPackages from './components/CreditPackages';
import SkeletonLoader from './components/SkeletonLoader';

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    wallet,
    transactions,
    creditEarnings,
    withdrawalRequests,
    stats,
    isLoading,
    error,
    fetchWallet,
    fetchTransactions,
    fetchCreditEarnings,
    fetchWithdrawalRequests,
    fetchWalletStats,
    processCreditEarning,
    requestWithdrawal
  } = useWalletStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'earnings' | 'withdrawals' | 'purchase'>('overview');

  useEffect(() => {
    const loadWalletData = async () => {
      await Promise.all([
        fetchWallet(),
        fetchTransactions(),
        fetchCreditEarnings(),
        fetchWithdrawalRequests(),
        fetchWalletStats()
      ]);
    };

    loadWalletData();
  }, []);

  const handleProcessEarning = async (earningId: string) => {
    try {
      await processCreditEarning(earningId);
    } catch (error) {
      console.error('Erreur lors du traitement du gain:', error);
    }
  };

  const handleWithdrawalRequest = async (requestData: any) => {
    try {
      await requestWithdrawal(requestData);
    } catch (error) {
      console.error('Erreur lors de la demande de retrait:', error);
    }
  };

  if (isLoading && !wallet) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Erreur</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-20">
      <WalletHeader onBack={() => navigate(-1)} />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Balance Card */}
          <BalanceCard wallet={wallet} />

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
                { id: 'transactions', label: 'Transactions', icon: '💳' },
                { id: 'earnings', label: 'Gains', icon: '💰' },
                { id: 'withdrawals', label: 'Retraits', icon: '🏦' },
                { id: 'purchase', label: 'Acheter', icon: '🛒' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <WalletStats stats={stats} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransactionList 
                  transactions={transactions.slice(0, 5)} 
                  showHeader={true}
                  title="Transactions récentes"
                />
                <CreditEarnings 
                  earnings={creditEarnings.slice(0, 5)}
                  showHeader={true}
                  title="Gains récents"
                  onProcessEarning={handleProcessEarning}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TransactionList 
                transactions={transactions}
                showHeader={true}
                title="Toutes les transactions"
              />
            </motion.div>
          )}

          {activeTab === 'earnings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CreditEarnings 
                earnings={creditEarnings}
                showHeader={true}
                title="Tous les gains"
                onProcessEarning={handleProcessEarning}
              />
            </motion.div>
          )}

          {activeTab === 'withdrawals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <WithdrawalForm 
                onSubmit={handleWithdrawalRequest}
                currentBalance={wallet?.balance || 0}
              />
              {withdrawalRequests.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Demandes de retrait</h3>
                  <div className="space-y-3">
                    {withdrawalRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.amount} crédits
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${request.status === 'completed' ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        `}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'purchase' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CreditPackages />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;